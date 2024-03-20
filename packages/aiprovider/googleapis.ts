import { AxiosRequestConfig } from 'axios';
import { log } from 'logger/log';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
  CompletionRequest
} from 'spec/chat';
import { GptAPI } from './api';
import { CompletionProvider, getCompletionRequest } from './strategy';

interface Content {
  role: string;
  parts: { text: string }[];
}

export class GoogleGenerativeLanguageAPI
  extends GptAPI
  implements CompletionProvider
{
  constructor(
    apiKey: string,
    timeout: number,
    defaultCompletionModel: string,
    defaultChatCompletionModel: string,
    origin: string,
    headers: Record<string, string> = {}
  ) {
    const apiKeyHeaderKey = '';
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

  convertMessages(messages: ChatCompletionRequestMessage[]): Content[] {
    return messages.map(message => {
      let role: string = 'user';
      switch (message.role) {
        case ChatCompletionRoleEnum.user:
          role = 'user';
          break;
        case ChatCompletionRoleEnum.assistant:
          role = 'model';
          break;
      }
      return {
        role,
        parts: [
          {
            text: message.content || '' // If content is undefined, use an empty string
          }
        ]
      };
    });
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

    let generateConfig: Record<string, any> = {
      maxOutputTokens: input.maxTokens ? input.maxTokens : 4096,
      temperature: input.temperature ? input.temperature : 0.1
    };

    if (input.additionalParameters) {
      for (const key in input.additionalParameters) {
        if (!generateConfig.hasOwnProperty(key)) {
          generateConfig[key] = input.additionalParameters[key];
        }
      }
    }

    let content = this.convertMessages(input.messages);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const request: Record<string, any> = {
      contents: content,
      generationConfig: generateConfig
    };

    const modelpath = `/v1/models/${input.model}:generateContent?key=${this.apiKey}`;
    const requestConfig: AxiosRequestConfig = {
      url: modelpath,
      method: 'POST',
      data: request
    };

    const data = await this.request(requestConfig);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data response. Expected an object.' + data);
    }
    let respText = '';
    if (
      'candidates' in data &&
      Array.isArray(data.candidates) &&
      data.candidates.length > 0
    ) {
      if (
        'content' in data.candidates[0] &&
        'parts' in data.candidates[0].content &&
        Array.isArray(data.candidates[0].content.parts) &&
        data.candidates[0].content.parts.length > 0 &&
        'text' in data.candidates[0].content.parts[0]
      ) {
        respText = data.candidates[0].content.parts[0].text as string;
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

export function getGoogleGenerativeLanguageProvider(): CompletionProvider {
  // Default values for Google Generative Language Provider
  const apiKey = '';
  const timeout = 120;
  const defaultCompletionModel = 'gemini-1.0-pro';
  const defaultChatCompletionModel = 'gemini-1.0-pro';
  const defaultOrigin = 'https://generativelanguage.googleapis.com';

  log.info('GoogleGenerativeLanguage API provider initialized');
  return new GoogleGenerativeLanguageAPI(
    apiKey,
    timeout,
    defaultCompletionModel,
    defaultChatCompletionModel,
    defaultOrigin
  );
}
