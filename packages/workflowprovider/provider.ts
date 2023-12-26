import { getAnthropicProvider } from 'aiprovider/anthropic';
import { filterSensitiveInfoFromJsonString } from 'aiprovider/api';
import { getGoogleGenerativeLanguageProvider } from 'aiprovider/googleapis';
import { getHuggingFaceProvider } from 'aiprovider/huggingface';
import { getOpenAIProvider } from 'aiprovider/openaiapi';
import {
  CompletionProvider,
  Providers,
  unescapeChars
} from 'aiprovider/strategy';
import { v4 as uuidv4 } from 'uuid';

import { getLlamaCPPAPIProvider } from 'aiprovider/llamacpp';
import { ConversationCollection } from 'conversations/collection';
import { loadConversations } from 'conversations/loader';
import { log } from 'logger/log';
import { Command } from 'prompts/promptdef/promptcommand';
import { FilesImporter } from 'prompts/promptimporter/filesimporter';
import { systemVariableNames } from 'prompts/promptimporter/predefinedvariables';
import { CommandRunnerContext } from 'prompts/promptimporter/promptcommandrunner';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
  CompletionRequest
} from 'spec/chat';

export class WorkflowProvider {
  public aiproviders: Providers;
  public commandRunnerContext: CommandRunnerContext;
  public conversationHistoryPath: string;
  public conversationCollection: ConversationCollection;

  constructor() {
    this.commandRunnerContext = new CommandRunnerContext();

    this.conversationHistoryPath = '';
    this.conversationCollection = new ConversationCollection();

    this.aiproviders = new Providers('');
    this.aiproviders.addProvider('openai', getOpenAIProvider());
    this.aiproviders.addProvider('anthropic', getAnthropicProvider());
    this.aiproviders.addProvider('huggingface', getHuggingFaceProvider());
    this.aiproviders.addProvider(
      'googlegl',
      getGoogleGenerativeLanguageProvider()
    );
    this.aiproviders.addProvider('llamacpp', getLlamaCPPAPIProvider());
  }

  public importConversations(
    conversationHistoryPath: string,
    startNewConversation = false
  ) {
    if (!conversationHistoryPath) {
      log.log('Empty conversations history path');
      return;
    }
    this.conversationHistoryPath = conversationHistoryPath;
    log.info('Conversation history path: ', conversationHistoryPath);

    const conversations = loadConversations(conversationHistoryPath);
    if (!conversations) {
      log.error(
        'Couldnt load conversations from path: ',
        conversationHistoryPath
      );
      return;
    }

    this.conversationHistoryPath = conversationHistoryPath;
    this.conversationCollection = conversations;
    if (startNewConversation) {
      this.conversationCollection.startNewConversation();
    }
  }

  public clearConversation() {
    this.conversationCollection.saveAndStartNewConversation(
      this.conversationHistoryPath,
      true
    );
  }

  public saveConversation() {
    this.conversationCollection.saveCurrentConversation(
      this.conversationHistoryPath,
      true
    );
  }

  public importAllPromptFiles(promptPaths: string[]) {
    if (!promptPaths) {
      log.info('Empty prompt paths provided for importing');
      return;
    }
    if (!this.commandRunnerContext) {
      log.info('Command runner not available for importing');
      return;
    }
    log.info('Starting import of prompt files now');
    const fi = new FilesImporter(this.commandRunnerContext);
    fi.importPromptFiles(promptPaths);

    const allc = this.commandRunnerContext.getAllCommandsAsLabels();
    log.info(`Done Loading all commands from paths: `, promptPaths);
    // log.info(`Commands: ${JSON.stringify(allc, null, 2)}`);
  }

  public prepareCommand(line: string): {
    question: string;
    command: Command;
    reqID: string;
  } {
    const preparedIn = this.commandRunnerContext?.prepareAndSetCommand(
      line,
      '',
      false
    );
    if (!preparedIn?.command) {
      throw Error('Could not get prepared command');
    }
    const question = (preparedIn?.question as string) || '';
    const command = preparedIn.command;
    const reqID = uuidv4();
    return { question, command, reqID };
  }

  public async createCompletionRequest(
    reqUUID: string,
    inPrompt: string,
    question: string,
    command: Command,
    useConversation = false
  ) {
    const model = command.requestparams?.model as string;
    const providerName = (command.requestparams?.provider as string) || '';
    const apiProvider = this.aiproviders.getProvider(model, providerName);
    if (!apiProvider) {
      throw Error('Could not get the ai provider for input model');
    }
    let messages: ChatCompletionRequestMessage[] | null = null;
    if (useConversation) {
      messages =
        this.conversationCollection.currentConversation?.getMessagesAsRequests();
    }
    const crequest = apiProvider.checkAndPopulateCompletionParams(
      question,
      messages,
      command.requestparams
    );
    if (!crequest) {
      throw Error('Could not create api request');
    }

    const crequestStr = JSON.stringify(crequest, null, 2);

    if (useConversation && crequest.messages && crequest.messages.length >= 1) {
      this.conversationCollection.addMessagesToCurrent([
        crequest.messages[crequest.messages.length - 1]
      ]);
      this.conversationCollection.addViewsToCurrent([
        {
          type: 'addQuestion',
          value: inPrompt,
          id: reqUUID,
          full: crequestStr
        }
      ]);
    }
    log.info(`Got api request. Full request: ${crequestStr}`);
    return { apiProvider, crequest, crequestStr };
  }

  public async getCompletionResponse(
    reqUUID: string,
    apiProvider: CompletionProvider,
    crequest: CompletionRequest,
    useConversation = false,
    docLanguage: string = ''
  ) {
    const completionResponse = await apiProvider.completion(crequest);
    // let completionResponse = {fullResponse: "full", data:"This is a unittest \n ```def myfunc(): print('hello there')```"};

    let response = completionResponse?.data as string | '';
    let fullResponseStr = '';
    if (response) {
      response = unescapeChars(response);
    } else {
      response = 'Got empty response';
    }
    fullResponseStr = JSON.stringify(completionResponse?.fullResponse, null, 2);

    if (useConversation) {
      this.conversationCollection.addMessagesToCurrent([
        { role: 'assistant' as ChatCompletionRoleEnum, content: response }
      ]);
      this.conversationCollection.addViewsToCurrent([
        {
          type: 'addResponse',
          value: response,
          id: reqUUID,
          full: fullResponseStr,
          params: { done: true, docLanguage: docLanguage }
        }
      ]);
    }

    return { response, fullResponseStr };
  }

  public postProcessResp(
    command: Command,
    response: string,
    docLanguage: string = ''
  ) {
    let retResp = response;
    this.commandRunnerContext.processAnswer(command, response, docLanguage);
    const processedResponse = this.commandRunnerContext.getSystemVariable(
      systemVariableNames.sanitizedAnswer
    );
    if (processedResponse) {
      retResp = processedResponse;
    }
    return retResp;
  }

  public async getResponseUsingInput(line: string) {
    let fullReqStr = '';
    let response = '';
    let fullResponseStr = '';
    let reqUUID = '';

    try {
      const { question, command, reqID } = this.prepareCommand(line);
      // Send the search prompt to the API instance
      // this._fullPrompt = preparedQuestion;
      // log.info(`Request params read: ${JSON.stringify(command.requestparams, null, 2)}`);
      reqUUID = reqID;
      const { apiProvider, crequest, crequestStr } =
        await this.createCompletionRequest(reqUUID, line, question, command);
      fullReqStr = crequestStr;

      const resp = await this.getCompletionResponse(
        reqUUID,
        apiProvider,
        crequest
      );
      response = resp.response;
      fullResponseStr = resp.fullResponseStr;
    } catch (e) {
      log.error(e);
      response = `[ERROR] ${e}`;
      fullResponseStr = filterSensitiveInfoFromJsonString(
        JSON.stringify(e, null, 2)
      );
    }
    log.info(`Got response: ${response}\n Full response: ${fullResponseStr}`);
    return { reqUUID, fullReqStr, response, fullResponseStr };
  }
}
