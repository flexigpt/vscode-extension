import { getAnthropicProvider } from 'aiprovider/anthropic';
import { filterSensitiveInfoFromJsonString } from 'aiprovider/api';
import { getGoogleGenerativeLanguageProvider } from 'aiprovider/googleapis';
import { getHuggingFaceProvider } from 'aiprovider/huggingface';
import { getOpenAIProvider } from 'aiprovider/openaiapi';
import { CompletionProvider, Providers } from 'aiprovider/strategy';
import * as prettier from 'prettier';
import { v4 as uuidv4 } from 'uuid';

import { getLlamaCPPAPIProvider } from 'aiprovider/llamacpp';
import { ConversationCollection } from 'conversations/collection';
import { loadConversations } from 'conversations/loader';
import { log } from 'logger/log';
import { Command } from 'prompts/promptdef/promptcommand';
import { FilesImporter } from 'prompts/promptimporter/filesimporter';
import { CommandRunnerContext } from 'prompts/promptimporter/promptcommandrunner';
import { CompletionRequest } from 'spec/chat';

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

  public importConversations(conversationHistoryPath: string) {
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
    // Start a new conversation and send message as done
    // if (this._conversationCollection) {
    //   this._conversationCollection.startNewConversation();
    //   this.sendConversationListMessage();
    // }
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

    // Refresh UI after import
    // this.sendCommandListMessage();
  }

  unescapeChars(text: string) {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }

  public prepareCommand(line: string): { question: string; command: Command } {
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
    return { question, command };
  }

  public async createCompletionRequest(question: string, command: Command) {
    const model = command.requestparams?.model as string;
    const providerName = (command.requestparams?.provider as string) || '';
    const apiProvider = this.aiproviders.getProvider(model, providerName);
    if (!apiProvider) {
      throw Error('Could not get the ai provider for input model');
    }
    const crequest = apiProvider.checkAndPopulateCompletionParams(
      question,
      null,
      command.requestparams
    );
    if (!crequest) {
      throw Error('Could not create api request');
    }

    const crequestJsonStr = JSON.stringify(crequest, null, 2);
    let crequestStr = '';
    if (crequestJsonStr) {
      crequestStr = await prettier.format(crequestJsonStr, {
        parser: 'json'
      });
    }
    const reqID = uuidv4();
    log.info(`Got api request. Full request: ${crequestStr}`);
    return { apiProvider, crequest, crequestStr, reqID };
  }

  public async getCompletionResponse(
    apiProvider: CompletionProvider,
    crequest: CompletionRequest
  ) {
    const completionResponse = await apiProvider.completion(crequest);
    // let completionResponse = {fullResponse: "full", data:"This is a unittest \n ```def myfunc(): print('hello there')```"};

    let response = completionResponse?.data as string | '';
    let fullResponseStr = '';
    if (response) {
      response = this.unescapeChars(response);
    } else {
      response = 'Got empty response';
    }
    fullResponseStr = JSON.stringify(completionResponse?.fullResponse, null, 2);
    return { response, fullResponseStr };
  }

  public async getResponseUsingInput(line: string) {
    let fullReqStr = '';
    let response = '';
    let fullResponseStr = '';
    let reqUUID = '';

    try {
      const { question, command } = this.prepareCommand(line);
      // Send the search prompt to the API instance
      // this._fullPrompt = preparedQuestion;
      // log.info(`Request params read: ${JSON.stringify(command.requestparams, null, 2)}`);
      const { apiProvider, crequest, crequestStr, reqID } =
        await this.createCompletionRequest(question, command);
      fullReqStr = crequestStr;
      reqUUID = reqID;
      const resp = await this.getCompletionResponse(apiProvider, crequest);
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
