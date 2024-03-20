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
  filterMessagesByTokenCount,
  getCompletionRequest
} from './strategy';

export class HuggingFaceAPI extends GptAPI implements CompletionProvider {
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

  async getModelType(model: string) {
    const requestConfig: AxiosRequestConfig = {
      url: '/models/' + model,
      method: 'GET'
    };
    const data = await this.request(requestConfig);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data response. Expected an object.');
    }
    if ('tags' in data) {
      const tags = data.tags as string[];
      if ('conversational' in tags) {
        return 'chat';
      }
    }
    return 'completion';
  }
  async completion(input: CompletionRequest): Promise<any> {
    return this.chatCompletion(input);
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  getInputs(messages: ChatCompletionRequestMessage[]): {
    text: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    generated_responses: string[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    past_user_inputs: string[];
  } {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const generated_responses: string[] = [];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const past_user_inputs: string[] = [];
    let text = '';

    for (let i = 0; i < messages.length; i++) {
      const icontent: string = messages[i].content || '';
      if (messages[i].role === ChatCompletionRoleEnum.assistant) {
        generated_responses.push(icontent);
      } else if (
        messages[i].role === ChatCompletionRoleEnum.user ||
        messages[i].role === ChatCompletionRoleEnum.system
      ) {
        past_user_inputs.push(icontent);

        // Assuming the last input from the user is at the end of the array
        if (i === messages.length - 1) {
          text = icontent;
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { text, generated_responses, past_user_inputs };
  }

  async chatCompletion(input: CompletionRequest): Promise<any> {
    if (!input.messages) {
      throw Error('No input messages found');
    }
    const model = input.model;
    const modeltype = await this.getModelType(model);

    const parameters: Record<string, any> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_length: input.maxTokens ? input.maxTokens : 4096,
      temperature: input.temperature ? input.temperature : 0.1,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_time: input.timeout ? input.timeout : this.timeout
    };

    if (input.additionalParameters) {
      for (const key in input.additionalParameters) {
        if (!parameters.hasOwnProperty(key)) {
          parameters[key] = input.additionalParameters[key];
        }
      }
    }

    if (modeltype !== 'chat') {
      parameters.return_full_text = false;
      if (!input.maxTokens || input.maxTokens > 250) {
        parameters.max_length = 250;
      }
    }
    let filterTokens = 250;
    if (parameters.max_length) {
      filterTokens = parameters.max_length;
    }
    const messages = filterMessagesByTokenCount(input.messages, filterTokens);

    const inputmessages = this.getInputs(messages);

    const request: Record<string, any> = {
      parameters: parameters
    };

    if (modeltype === 'chat') {
      request.inputs = inputmessages;
    } else {
      request.inputs = inputmessages.text;
    }

    const requestConfig: AxiosRequestConfig = {
      url: '/models/' + input.model,
      method: 'POST',
      data: request
    };
    const data = await this.request(requestConfig);
    const fullResponse = data;
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data response. Expected an object.' + data);
    }
    let respText = '';
    if ('generated_text' in data) {
      respText = data.generated_text as string;
    } else if (Array.isArray(data) && data.length > 0) {
      // Get 'generated_text' from the first element of the array, if the array is not empty
      respText = data[0].generated_text as string;
    }
    return { fullResponse: fullResponse, data: respText };
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

export function getHuggingFaceProvider(): CompletionProvider {
  // Default values for Hugging Face Provider
  const apiKey = '';
  const timeout = 120;
  const defaultCompletionModel = 'bigcode/starcoder2-15b';
  const defaultChatCompletionModel = 'deepseek-ai/deepseek-coder-1.3b-instruct';
  const defaultOrigin = 'https://api-inference.huggingface.co';

  log.info('HuggingFace API provider initialized');
  return new HuggingFaceAPI(
    apiKey,
    timeout,
    defaultCompletionModel,
    defaultChatCompletionModel,
    defaultOrigin
  );
}
