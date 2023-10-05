import { GptAPI } from './api';
import { CompletionProvider, filterMessagesByTokenCount } from './strategy';
import { AxiosRequestConfig } from 'axios';
import { log } from 'logger/log';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
  CompletionRequest
} from 'spec/chat';

export class LlamaCPPAPIProvider extends GptAPI implements CompletionProvider {
  #timeout: number;
  defaultCompletionModel: string;
  defaultChatCompletionModel: string;

  constructor(
    apiKey: string,
    timeout: number,
    defaultCompletionModel: string,
    defaultChatCompletionModel: string,
    origin: string,
    headers: Record<string, string> = {}
  ) {
    let apiKeyHeaderKey = '';
    if (apiKey !== '') {
      apiKeyHeaderKey = 'Authorization';
    }
    const defaultHeaders: Record<string, string> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'content-type': 'application/json'
    };
    super(origin, apiKey, apiKeyHeaderKey, {
      ...defaultHeaders,
      ...headers
    });
    this.#timeout = timeout;
    this.defaultCompletionModel = defaultCompletionModel;
    this.defaultChatCompletionModel = defaultChatCompletionModel;
  }

  convertChat(
    messages: ChatCompletionRequestMessage[],
    chatPrompt = 'A chat between a curious user and an artificial intelligence assistant',
    systemName = "\\nASSISTANT's RULE: ",
    userName = '\\nUSER: ',
    aiName = '\\nASSISTANT: ',
    stop = '</s>'
  ): string {
    let prompt = '' + chatPrompt.replace('\\n', '\n');

    const systemN = systemName.replace('\\n', '\n');
    const userN = userName.replace('\\n', '\n');
    const aiN = aiName.replace('\\n', '\n');
    const stopSymbol = stop.replace('\\n', '\n');

    for (const line of messages) {
      if (line.role === ChatCompletionRoleEnum.system) {
        prompt += `${systemN}${line.content}`;
      }
      if (line.role === ChatCompletionRoleEnum.user) {
        prompt += `${userN}${line.content}`;
      }
      if (line.role === ChatCompletionRoleEnum.assistant) {
        prompt += `${aiN}${line.content}${stopSymbol}`;
      }
    }
    prompt += aiN.trimEnd();

    return prompt;
  }

  async completion(input: CompletionRequest) {
    return this.chatCompletion(input);
  }

  async chatCompletion(input: CompletionRequest) {
    // return tempCodeString;
    // let messages: ChatCompletionRequestMessage[] = [{"role": "user", "content": "Hello!"}];
    if (!input.messages) {
      throw Error('No input messages found');
    }
    // let chatModel = true;
    // if (input.model.startsWith("gpt-3.5") || input.model.startsWith("gpt-4")) {
    //   chatModel = true;
    // }
    let stoparg: string[] | null = null;
    if (input.stop) {
      if (Array.isArray(input.stop)) {
        stoparg = input.stop;
      } else {
        stoparg = [input.stop];
      }
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const request: Record<string, any> = {
      prompt: this.convertChat(input.messages),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      n_predict: input.maxTokens,
      stream: false,
      stop: stoparg
    };
    if (input.additionalParameters) {
      for (const key in input.additionalParameters) {
        // eslint-disable-next-line no-prototype-builtins
        if (!request.hasOwnProperty(key)) {
          request[key] = input.additionalParameters[key];
        }
      }
    }
    const modelpath = '/completion';
    let filterTokens = 2048;
    if (input.maxTokens) {
      filterTokens = input.maxTokens;
    }
    request.messages = filterMessagesByTokenCount(input.messages, filterTokens);

    const requestConfig: AxiosRequestConfig = {
      url: modelpath,
      method: 'POST',
      data: request
    };
    try {
      const data = await this.request(requestConfig);
      const fullResponse = data;
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid data response. Expected an object.' + data);
      }
      const respText = 'content' in data ? (data?.content as string) : '';
      return {
        fullResponse: fullResponse,
        data: respText
      };
    } catch (error) {
      log.error('Error in completion request: ' + error);
      throw error;
    }
  }

  public checkAndPopulateCompletionParams(
    prompt: string | null,
    messages: Array<ChatCompletionRequestMessage> | null,
    inputParams?: { [key: string]: any }
  ): CompletionRequest {
    const model =
      (inputParams?.model as string) || this.defaultChatCompletionModel;
    const completionRequest: CompletionRequest = {
      model: model,
      prompt: prompt,
      messages: messages,
      suffix: inputParams?.suffix || undefined,
      maxTokens: inputParams?.maxTokens,
      stream: false,
      stop: inputParams?.stop || undefined
    };

    if (inputParams) {
      for (const key in inputParams) {
        completionRequest.additionalParameters =
          completionRequest.additionalParameters || {};
        // eslint-disable-next-line no-prototype-builtins
        if (!completionRequest.hasOwnProperty(key) && key !== 'provider') {
          completionRequest.additionalParameters[key] = inputParams[key];
        }
      }
    }

    if (completionRequest.prompt) {
      const message: ChatCompletionRequestMessage = {
        role: ChatCompletionRoleEnum.user,
        content: completionRequest.prompt
      };
      if (!completionRequest.messages) {
        completionRequest.messages = [message];
      } else {
        completionRequest.messages.push(message);
      }
    }
    completionRequest.prompt = null;

    return completionRequest;
  }
}
