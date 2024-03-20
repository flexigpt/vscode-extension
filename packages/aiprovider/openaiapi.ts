import { AxiosRequestConfig } from 'axios';
import { log } from 'logger/log';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
  CompletionRequest
} from 'spec/chat';
import { GptAPI } from './api';
import {
  CompletionProvider,
  getCompletionRequest,
  unescapeChars
} from './strategy';

export class OpenAIAPIProvider extends GptAPI implements CompletionProvider {
  constructor(
    apiKey: string,
    timeout: number,
    defaultCompletionModel: string,
    defaultChatCompletionModel: string,
    origin: string,
    headers: Record<string, string> = {}
  ) {
    const apiKeyHeaderKey = 'Authorization';
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

  async completion(input: CompletionRequest) {
    // return {
    //   fullResponse: "full",
    //   data: "data",
    // };
    return this.chatCompletion(input);
  }

  async chatCompletion(input: CompletionRequest) {
    // return tempCodeString;
    // let messages: ChatCompletionRequestMessage[] = [{"role": "user", "content": "Hello!"}];
    if (!input.messages) {
      throw Error('No input messages found');
    }
    let chatModel = false;
    if (input.model.startsWith('gpt-3.5') || input.model.startsWith('gpt-4')) {
      chatModel = true;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const request: Record<string, any> = {
      model: input.model,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_tokens: input.maxTokens ? input.maxTokens : 4096,
      temperature: input.temperature ? input.temperature : 0.1,
      stream: false
    };

    if (input.additionalParameters) {
      for (const key in input.additionalParameters) {
        if (!request.hasOwnProperty(key) && key !== 'systemPrompt') {
          request[key] = input.additionalParameters[key];
        }
      }
    }

    let modelpath = '/v1/completions';
    if (chatModel) {
      modelpath = '/v1/chat/completions';
      request.messages = input.messages;
      if (input.additionalParameters) {
        for (const key in input.additionalParameters) {
          // eslint-disable-next-line no-prototype-builtins
          if (key === 'systemPrompt' && typeof key === 'string') {
            request['system'] = input.additionalParameters[key];
            const message: ChatCompletionRequestMessage = {
              role: ChatCompletionRoleEnum.system,
              content: input.additionalParameters[key]
            };
            request.messages = input.messages.unshift(message);
            break;
          }
        }
      }
    } else {
      request.prompt = input.messages[-1].content || '';
    }

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
      let respText = '';
      let functionName = '';
      let functionArgs: any;
      if (
        'choices' in data &&
        Array.isArray(data.choices) &&
        data.choices.length > 0
      ) {
        if (!chatModel) {
          respText = data.choices[0].text ? data.choices[0].text : '';
        } else {
          const responseMessage = data.choices[0].message;
          respText = responseMessage?.content
            ? (responseMessage?.content as string)
            : '';
          if (
            'tool_calls' in responseMessage &&
            responseMessage['tool_calls'].length > 0 &&
            'function' in responseMessage['tool_calls'][0]
          ) {
            functionName = responseMessage['tool_calls'][0]['function']['name'];
            respText += '\nFunction call:\nName:' + functionName;
            try {
              functionArgs = JSON.parse(
                unescapeChars(
                  responseMessage['tool_calls'][0]['function']['arguments']
                )
              );
            } catch (error) {
              log.error(
                'Error parsing function call arguments: ' +
                  error +
                  ' ' +
                  responseMessage['tool_calls'][0]['function']['arguments']
              );
              respText += '\nError in parsing returned args\n';
              functionArgs =
                responseMessage['tool_calls'][0]['function']['arguments'];
            }
            respText += '\nArgs: ' + JSON.stringify(functionArgs, null, 2);
          }
        }
      }
      return {
        fullResponse: fullResponse,
        data: respText,
        functionName: functionName,
        functionArgs: functionArgs
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

export function getOpenAIProvider(): CompletionProvider {
  // Default values for OpenAI Provider
  const apiKey = '';
  const timeout = 120;
  const defaultCompletionModel = 'gpt-3.5-turbo';
  const defaultChatCompletionModel = 'gpt-3.5-turbo';
  const defaultOrigin = 'https://api.openai.com';

  log.info('OpenAI API provider initialized');
  return new OpenAIAPIProvider(
    apiKey,
    timeout,
    defaultCompletionModel,
    defaultChatCompletionModel,
    defaultOrigin
  );
}
