import { GptAPI } from "./api";
import { CompletionProvider, filterMessagesByTokenCount } from "./strategy";
import {
  CompletionRequest,
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
} from "./conversationspec";
import { AxiosRequestConfig } from "axios";

export class AnthropicAPI extends GptAPI implements CompletionProvider {
  #timeout: BigInt;
  defaultCompletionModel: string;
  defaultChatCompletionModel: string;
  
  constructor(apiKey: string, 
    timeout: BigInt,
    defaultCompletionModel: string = "claude-2",
    defaultChatCompletionModel: string = "claude-2",
    headers: Record<string, string> = {}) {
    
    const origin = "https://api.anthropic.com";
    const apiKeyHeaderKey = "x-api-key";
    const defaultHeaders: Record<string, string> = {
      accept: "application/json",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "anthropic-version": "2023-06-01",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "content-type": "application/json",
    };
    super(
      origin,
      apiKey,
      apiKeyHeaderKey,
      {
        ...defaultHeaders,
        ...headers,
      }
    );
    this.#timeout = timeout;
    this.defaultCompletionModel = defaultCompletionModel;
    this.defaultChatCompletionModel = defaultChatCompletionModel;
  }

  generateMessageString(messages: ChatCompletionRequestMessage[]): string {
    return (
      messages
        .map((message) => {
          let roleString: string;
          switch (message.role) {
            case ChatCompletionRoleEnum.system:
              roleString = "\n\nHuman:";
              break;
            case ChatCompletionRoleEnum.user:
              roleString = "\n\nHuman:";
              break;
            case ChatCompletionRoleEnum.assistant:
              roleString = "\n\nAssistant:";
              break;
            default:
              roleString = "";
              break;
          }
          return `${roleString} ${message.content}`;
        })
        .join("") + "\n\nAssistant:"
    );
  }

  async completion(input: CompletionRequest): Promise<any> {
    return this.chatCompletion(input);
  }

  async chatCompletion(input: CompletionRequest): Promise<any> {
    if (!input.prompt) {
      throw Error("No input messages found");
    }

    let stoparg: string | string[] = ["\n\nHuman:"];
    if (input.stop) {
      if (Array.isArray(input.stop)) {
        stoparg = input.stop;
      } else {
        stoparg = [input.stop];
      }
    }
    let metadata = {};
    if (input.user) {
      metadata = {
        user: input.user,
      };
    }
    const request = {
      model: input.model,
      prompt: input.prompt,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_tokens_to_sample: input.maxTokens ? input.maxTokens : 4096,
      temperature: input.temperature,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      top_p: input.topP,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      top_k: input.topK,
      stream: false,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      stop_sequences: stoparg,
      metadata: metadata,
    };
    const requestConfig: AxiosRequestConfig = {
      url: "/v1/complete",
      method: "POST",
      data: request,
    };
    try {
      const data = await this.request(requestConfig);
      let fullResponse = data;
      if (typeof data !== "object" || data === null) {
        throw new Error("Invalid data response. Expected an object.");
      }
      let respText = "";
      if ("completion" in data) {
        respText = data.completion as string;
      }
      return { fullResponse: fullResponse, data: respText };
    } catch (error) {
      throw error;
    }
  }

  public checkAndPopulateCompletionParams(
    prompt: string | null,
    messages: Array<ChatCompletionRequestMessage> | null,
    inputParams?: { [key: string]: any }
  ): CompletionRequest {
    let stoparg: string | string[] = ["\n\nHuman:"];
    if (inputParams?.stop) {
      if (Array.isArray(inputParams.stop)) {
        stoparg = inputParams.stop;
      } else {
        stoparg = [inputParams.stop];
      }
    }
    if (!inputParams) {
      inputParams = {};
    } 
    inputParams.stop = stoparg;
    
    let completionRequest: CompletionRequest = {
      model: (inputParams?.model as string) || this.defaultCompletionModel,
      prompt: prompt,
      messages: messages,
      maxTokens: inputParams?.maxTokens || 16000,
      temperature: inputParams?.temperature,
      topP: inputParams?.topP,
      topK: inputParams?.topK,
      stream: false,
      stop: inputParams?.stop || undefined,
    };

    if (completionRequest.prompt) {
      let message: ChatCompletionRequestMessage = {
        role: ChatCompletionRoleEnum.user,
        content: completionRequest.prompt,
      };
      if (!completionRequest.messages) {
        completionRequest.messages = [message];
      } else {
        completionRequest.messages.push(message);
      }
    }
    if (completionRequest.messages) {
      let filterTokens = 2048;
      if (completionRequest.maxTokens) {
        filterTokens = completionRequest.maxTokens;
      }
      let messages = filterMessagesByTokenCount(completionRequest.messages, filterTokens);
      completionRequest.prompt = this.generateMessageString(messages);
    }
    return completionRequest;
  }
}
