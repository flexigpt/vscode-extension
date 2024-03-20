import { AxiosRequestConfig } from 'axios';
import { log } from 'logger/log';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
  CompletionRequest
} from 'spec/chat';
import { GptAPI } from './api';
import { CompletionProvider, getCompletionRequest } from './strategy';

export class LlamaCPPAPIProvider extends GptAPI implements CompletionProvider {
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
    super(
      origin,
      apiKey,
      apiKeyHeaderKey,
      timeout,
      defaultCompletionModel,
      defaultChatCompletionModel,
      {
        ...defaultHeaders,
        ...headers
      }
    );
  }

  convertChat(
    messages: ChatCompletionRequestMessage[],
    userName = '\\nUSER: ',
    aiName = '\\nASSISTANT: ',
    stop = '</s>'
  ): string {
    let prompt = '';

    const userN = userName.replace('\\n', '\n');
    const aiN = aiName.replace('\\n', '\n');
    const stopSymbol = stop.replace('\\n', '\n');

    for (const line of messages) {
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const request: Record<string, any> = {
      prompt: this.convertChat(input.messages),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      n_predict: input.maxTokens ? input.maxTokens : 1024,
      temperature: input.temperature ? input.temperature : 0.1,
      stream: false
    };

    if (input.additionalParameters) {
      for (const key in input.additionalParameters) {
        if (key === 'systemPrompt' && typeof key === 'string') {
          request['system_prompt'] = input.additionalParameters[key];
          continue;
        }
        // eslint-disable-next-line no-prototype-builtins
        if (!request.hasOwnProperty(key)) {
          request[key] = input.additionalParameters[key];
        }
      }
    }

    const requestConfig: AxiosRequestConfig = {
      url: '/completion',
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
    return getCompletionRequest(
      this.defaultChatCompletionModel,
      prompt,
      messages,
      inputParams
    );
  }
}

export function getDefaultLlamaCPPAPIProvider(): CompletionProvider {
  // Default values for LlamaCPP API Provider
  const apiKey = '';
  const timeout = 120;
  const defaultCompletionModel = 'llama2';
  const defaultChatCompletionModel = 'llama2';
  const defaultOrigin = 'http://127.0.0.1:8080';

  log.info('LlamaCPP API provider initialized');
  return new LlamaCPPAPIProvider(
    apiKey,
    timeout,
    defaultCompletionModel,
    defaultChatCompletionModel,
    defaultOrigin
  );
}
