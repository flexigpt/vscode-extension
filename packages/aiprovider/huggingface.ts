import { log } from "@/logger/log";
import { GptAPI } from "@/aiprovider/api";
import { CompletionProvider, filterMessagesByTokenCount } from "@/aiprovider/strategy";
import {
  CompletionRequest,
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
} from "@/spec/chat";
import { AxiosRequestConfig } from "axios";

export class HuggingFaceAPI extends GptAPI implements CompletionProvider {
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
    const apiKeyHeaderKey = "Authorization";
    const defaultHeaders: Record<string, string> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "content-type": "application/json",
    };
    super(origin, apiKey, apiKeyHeaderKey, {
      ...defaultHeaders,
      ...headers,
    });
    this.#timeout = timeout;
    this.defaultCompletionModel = defaultCompletionModel;
    this.defaultChatCompletionModel = defaultChatCompletionModel;
  }

  async getModelType(model: string) {
    const requestConfig: AxiosRequestConfig = {
      url: "/models/" + model,
      method: "GET",
    };
    const data = await this.request(requestConfig);
    if (typeof data !== "object" || data === null) {
      throw new Error("Invalid data response. Expected an object.");
    }
    if ("tags" in data) {
      const tags = data.tags as string[];
      if ("conversational" in tags) {
        return "chat";
      }
    }
    return "completion";
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
    let text = "";

    for (let i = 0; i < messages.length; i++) {
      const icontent: string = messages[i].content || "";
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
      throw Error("No input messages found");
    }
    const model = input.model;
    const modeltype = await this.getModelType(model);
    const parameters: Record<string, any> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_length: input.maxTokens,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      top_k: input.topK,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      top_p: input.topP,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      num_return_sequences: input.n,
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
    let filterTokens = 250;
    if (parameters.max_length) {
      filterTokens = parameters.max_length;
    }
    const messages = filterMessagesByTokenCount(input.messages, filterTokens);

    const inputmessages = this.getInputs(messages);

    const request: Record<string, any> = {
      parameters: parameters,
    };

    if (modeltype === "chat") {
      request.inputs = inputmessages;
    } else {
      request.inputs = inputmessages.text;
    }

    const requestConfig: AxiosRequestConfig = {
      url: "/models/" + input.model,
      method: "POST",
      data: request,
    };
    const data = await this.request(requestConfig);
    const fullResponse = data;
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
  }

  public checkAndPopulateCompletionParams(
    prompt: string | null,
    messages: Array<ChatCompletionRequestMessage> | null,
    inputParams?: { [key: string]: any }
  ): CompletionRequest {
    const completionRequest: CompletionRequest = {
      model: (inputParams?.model as string) || this.defaultCompletionModel,
      prompt: prompt,
      messages: messages,
      maxTokens: inputParams?.maxTokens,
      temperature: inputParams?.temperature,
      topP: inputParams?.topP,
      topK: inputParams?.topK,
      n: inputParams?.n,
      stream: false,
      presencePenalty: inputParams?.presencePenalty,
      timeout: inputParams?.timeout,
    };

    if (completionRequest.prompt) {
      const message: ChatCompletionRequestMessage = {
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
