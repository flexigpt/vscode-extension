import log from "../logger/log";
import { GptAPI } from "./api";
import { CompletionRequest, CompletionProvider } from "./strategy";
import { AxiosRequestConfig } from "axios";

import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
} from "./conversationspec";

export class GoogleGenerativeLanguageAPI
  extends GptAPI
  implements CompletionProvider
{
  #timeout: BigInt;
  defaultCompletionModel: string;
  defaultChatCompletionModel: string;

  constructor(
    apiKey: string,
    timeout: BigInt,
    defaultCompletionModel: string = "text-bison-001",
    defaultChatCompletionModel: string = "chat-bison-001",
    headers: Record<string, string> = {}
  ) {
    const origin = "https://generativelanguage.googleapis.com";
    const endpoint = "/v1beta2";
    const apiKeyHeaderKey = "";
    const defaultHeaders: Record<string, string> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "content-type": "application/json",
    };
    super(origin, endpoint, apiKey, apiKeyHeaderKey, {
      ...defaultHeaders,
      ...headers,
    });
    this.#timeout = timeout;
    this.defaultCompletionModel = defaultCompletionModel;
    this.defaultChatCompletionModel = defaultChatCompletionModel;
  }

  async completion(input: CompletionRequest) {
    return this.chatCompletion(input);
  }

  async chatCompletion(input: CompletionRequest) {
    // return tempCodeString;
    // let messages: ChatCompletionRequestMessage[] = [{"role": "user", "content": "Hello!"}];
    if (!input.messages) {
      throw Error("No input messages found");
    }
    let chatModel: boolean = false;
    if (input.model.startsWith("chat")) {
      chatModel = true;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let request: Record<string, any> = {
      temperature: input.temperature,
      topP: input.topP,
      topK: input.topK,
      candidateCount: input.n,
    };

    if (chatModel) {
      request.prompt = {
        messages: input.messages.map((item) => {
          return {
            author: item.role,
            content: item.content,
          };
        }),
      };
    } else {
      request.prompt = { text: input.prompt };
      request.maxOutputTokens = input.maxTokens;
      let stoparg: string[] | null = null;
      if (input.stop) {
        if (Array.isArray(input.stop)) {
          stoparg = input.stop;
        } else {
          stoparg = [input.stop];
        }
      }
      request.stopSequences = stoparg;
    }

    let modelpath = `/models/${input.model}:generateText?key=${this.apiKey}}`;
    if (chatModel) {
      modelpath = `/models/${input.model}:generateMessage?key=${this.apiKey}}`;
    }
    const requestConfig: AxiosRequestConfig = {
      url: modelpath,
      method: "POST",
      data: request,
    };
    try {
      const data = await this.request(requestConfig);
      let fullResponse = data;
      if (typeof data !== "object" || data === null) {
        throw new Error("Invalid data response. Expected an object." + data);
      }
      let respText = "";
      if (
        "candidates" in data &&
        Array.isArray(data.candidates) &&
        data.candidates.length > 0
      ) {
        if (chatModel) {
          respText = data.candidates[0].content as string;
        } else {
          respText = data.candidates[0].output as string;
        }
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
    let model = (inputParams?.model as string) || this.defaultCompletionModel;
    let chatModel: boolean = false;
    if (model.startsWith("chat")) {
      chatModel = true;
    }
    let completionRequest: CompletionRequest = {
      model: model,
      prompt: prompt,
      messages: messages,
      maxTokens: inputParams?.maxTokens,
      temperature: inputParams?.temperature,
      topP: inputParams?.topP,
      topK: inputParams?.topK,
      n: inputParams?.n,
      stop: inputParams?.stop,
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
    if (chatModel && completionRequest.messages) {
      completionRequest.prompt = null;
    }
    return completionRequest;
  }
}
