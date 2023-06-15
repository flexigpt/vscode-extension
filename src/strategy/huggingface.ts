import { GptAPI } from "./api";
import { CompletionRequest, CompletionProvider } from "./strategy";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
} from "./conversationspec";
import { AxiosRequestConfig } from "axios";
import { checkAndPopulateCompletionParams } from "./strategyutils";
import log from "../logger/log";

export class HuggingFaceAPI extends GptAPI implements CompletionProvider {
  #timeout: BigInt;
  defaultCompletionModel: string;
  defaultChatCompletionModel: string;

  constructor(
    apiKey: string,
    timeout: BigInt,
    defaultCompletionModel: string = "bigcode/starcoderbase",
    defaultChatCompletionModel: string = "microsoft/DialoGPT-large",
    headers: Record<string, string> = {}
  ) {
    const origin = "https://api-inference.huggingface.co";
    const endpoint = "/models";
    const apiKeyHeaderKey = "Authorization";
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

  async getModelType(model: string) {
    const requestConfig: AxiosRequestConfig = {
      url: "/" + model,
      method: "GET",
    };
    try {
      const data = await this.request(requestConfig);
      let fullResponse = data;
      if (typeof data !== "object" || data === null) {
        throw new Error("Invalid data response. Expected an object.");
      }
      if ("tags" in data) {
        let tags = data.tags as string[];
        if ("conversational" in tags) {
          return "chat";
        }
      }
      return "completion";
    } catch (error) {
      throw error;
    }
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
    let generated_responses: string[] = [];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let past_user_inputs: string[] = [];
    let text: string = "";

    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === ChatCompletionRoleEnum.assistant) {
        generated_responses.push(messages[i].content);
      } else if (
        messages[i].role === ChatCompletionRoleEnum.user ||
        messages[i].role === ChatCompletionRoleEnum.system
      ) {
        past_user_inputs.push(messages[i].content);

        // Assuming the last input from the user is at the end of the array
        if (i === messages.length - 1) {
          text = messages[i].content;
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { text, generated_responses, past_user_inputs };
  }

  async chatCompletion(input: CompletionRequest): Promise<any> {
    if (!input.messages) {
      throw Error("No input messages found");
    }
    let model = input.model;
    let modeltype = await this.getModelType(model);
    let parameters: Record<string, any> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_length: input.maxTokens,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      top_k: input.n,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      top_p: input.topP,
      temperature: input.temperature,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      repetition_penalty: input.presencePenalty,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_time: input.timeout ? input.timeout : this.#timeout,
    };
    if (modeltype !== "chat") {
      parameters.return_full_text = false;
      if (!input.maxTokens || input.maxTokens > 250) {
        parameters.max_length = 250;
      }
    }

    const inputmessages = this.getInputs(input.messages);

    let request: Record<string, any> = {
      parameters: parameters,
    };

    if (modeltype === "chat") {
      request.inputs = inputmessages;
    } else {
      request.inputs = inputmessages.text;
    }

    const requestConfig: AxiosRequestConfig = {
      url: "/" + input.model,
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
      if ("generated_text" in data) {
        respText = data.generated_text as string;
      } else if (Array.isArray(data) && data.length > 0) {
        // Get 'generated_text' from the first element of the array, if the array is not empty
        respText = data[0].generated_text as string;
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
    let completionRequest: CompletionRequest = {
      model: (inputParams?.model as string) || this.defaultCompletionModel,
      prompt: prompt,
      messages: messages,
      maxTokens: inputParams?.maxTokens,
      temperature: inputParams?.temperature,
      topP: inputParams?.topP,
      n: inputParams?.n,
      stream: false,
      presencePenalty: inputParams?.presencePenalty,
      timeout: inputParams?.timeout,
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
      completionRequest.prompt = null;
    }

    return completionRequest;
  }
}
