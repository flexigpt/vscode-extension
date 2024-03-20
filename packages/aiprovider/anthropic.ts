import { AxiosRequestConfig } from 'axios';
import { log } from 'logger/log';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
  CompletionRequest
} from 'spec/chat';
import { GptAPI } from './api';
import { CompletionProvider, getCompletionRequest } from './strategy';

export class AnthropicAPI extends GptAPI implements CompletionProvider {
  constructor(
    apiKey: string,
    timeout: number,
    defaultCompletionModel: string,
    defaultChatCompletionModel: string,
    origin: string,
    headers: Record<string, string> = {}
  ) {
    const apiKeyHeaderKey = 'x-api-key';
    const defaultHeaders: Record<string, string> = {
      accept: 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'anthropic-version': '2023-06-01',
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

  async completion(input: CompletionRequest): Promise<any> {
    return this.chatCompletion(input);
  }

  async chatCompletion(input: CompletionRequest): Promise<any> {
    // return tempCodeString;
    // let messages: ChatCompletionRequestMessage[] = [{"role": "user", "content": "Hello!"}];
    if (!input.messages) {
      throw Error('No input messages found');
    }

    const request: Record<string, any> = {
      model: input.model,
      messages: input.messages,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_tokens: input.maxTokens ? input.maxTokens : 4096,
      temperature: input.temperature ? input.temperature : 0.1,
      stream: false
    };

    if (input.additionalParameters) {
      for (const key in input.additionalParameters) {
        // eslint-disable-next-line no-prototype-builtins
        if (key === 'systemPrompt' && typeof key === 'string') {
          request['system'] = input.additionalParameters[key];
          continue;
        }
        if (!request.hasOwnProperty(key)) {
          request[key] = input.additionalParameters[key];
        }
      }
    }

    // eslint-disable-next-line prefer-const
    let requestConfig: AxiosRequestConfig = {
      url: '/v1/messages',
      method: 'POST',
      data: request
    };
    const data = await this.request(requestConfig);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data response. Expected an object.');
    }
    let respText = '';
    if (
      'content' in data &&
      Array.isArray(data.content) &&
      data.content.length > 0
    ) {
      for (const resp of data.content) {
        respText += resp.text + '\n';
      }
    }
    return { fullResponse: data, data: respText };
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

export function getDefaultAnthropicProvider(): CompletionProvider {
  // Default values for Anthropic Provider
  const apiKey = '';
  const timeout = 120;
  const defaultCompletionModel = 'claude-3-haiku-20240307';
  const defaultChatCompletionModel = 'claude-3-haiku-20240307';
  const defaultOrigin = 'https://api.anthropic.com';

  log.info('Anthropic API provider initialized');
  return new AnthropicAPI(
    apiKey,
    timeout,
    defaultCompletionModel,
    defaultChatCompletionModel,
    defaultOrigin
  );
}
