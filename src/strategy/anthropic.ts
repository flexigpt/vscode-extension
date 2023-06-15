import { GptAPI } from "./api";
import { CompletionRequest, CompletionProvider } from "./strategy";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
} from "./conversationspec";
import { AxiosRequestConfig } from "axios";
import {
  checkAndPopulateCompletionParams,
} from "./strategyutils";

export class AnthropicAPI extends GptAPI implements CompletionProvider {
  #timeout: BigInt;
  defaultCompletionModel: string;
  defaultChatCompletionModel: string;
  
  constructor(apiKey: string, 
    timeout: BigInt,
    defaultCompletionModel: string = "claude-1",
    defaultChatCompletionModel: string = "claude-1",
    headers: Record<string, string> = {}) {
    
    const origin = "https://api.anthropic.com";
    const endpoint = "/v1/complete";
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
      endpoint,
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
    if (!input.messages) {
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
      top_k: input.n,
      stream: false,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      stop_sequences: stoparg,
      metadata: metadata,
    };
    const requestConfig: AxiosRequestConfig = {
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
    
    let req = checkAndPopulateCompletionParams(
      this.defaultChatCompletionModel,
      prompt,
      messages,
      inputParams
    );
    if (req.messages) {
      req.prompt = this.generateMessageString(req.messages);
    }

    return req;

  }
}