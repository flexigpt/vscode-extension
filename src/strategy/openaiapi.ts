import log from "../logger/log";
import {
  Configuration,
  OpenAIApi,
} from "openai";
import { CompletionRequest, CompletionProvider } from "./strategy";

import {
  ChatCompletionRequestMessage,
} from "./conversationspec";

import {
  checkAndPopulateCompletionParams,
} from "./strategyutils";

export const chatCompletionModelsEnum = {
  gptTurbo: "gpt-3.5-turbo",
  gptTurbo301: "gpt-3.5-turbo-0301",
  gptTurbo613: "gpt-3.5-turbo-0613",
  gpt4: "gpt-4",
};

export default class OpenAIAPIProvider implements CompletionProvider {
  #api: OpenAIApi;
  #timeout: BigInt;
  defaultCompletionModel: string;
  defaultChatCompletionModel: string;
  defaultEditModel: string;

  constructor(
    apiKey: string,
    timeout: BigInt,
    defaultCompletionModel: string = "text-davinci-003",
    defaultChatCompletionModel: string = "gpt-3.5-turbo",
    defaultEditModel: string = "code-davinci-edit-001"
  ) {
    const configuration = new Configuration({ apiKey: apiKey });
    this.#api = new OpenAIApi(configuration);
    this.#timeout = timeout;
    this.defaultCompletionModel = defaultCompletionModel;
    this.defaultChatCompletionModel = defaultChatCompletionModel;
    this.defaultEditModel = defaultEditModel;
  }

  checkEnumValue(
    value: string | null
  ): keyof typeof chatCompletionModelsEnum | null {
    if (value === null) {
      return null;
    }

    const keys = Object.keys(
      chatCompletionModelsEnum
    ) as (keyof typeof chatCompletionModelsEnum)[];
    const enumValue = keys.find(
      (key) => chatCompletionModelsEnum[key] === value
    );
    return enumValue || null;
  }

  async completion(input: CompletionRequest) {
    // return tempCodeString;
    let chatModel = this.checkEnumValue(input.model);
    if (chatModel) {
      return this.chatCompletion(input);
    }
    const { data } = await this.#api.createCompletion({
      model: input.model,
      prompt: input.prompt,
      suffix: input.suffix,
      max_tokens: input.maxTokens,
      temperature: input.temperature,
      top_p: input.topP,
      n: input.n,
      stream: false,
      logprobs: input.logprobs,
      echo: input.echo,
      stop: input.stop,
      presence_penalty: input.presencePenalty,
      frequency_penalty: input.frequencyPenalty,
      best_of: input.bestOf,
      logit_bias: input.logitBias,
      user: input.user,
    });
    return {
      fullResponse: data,
      data: data.choices[0].text ? data.choices[0].text : "",
    };
    // return data.choices[0].text ? data.choices[0].text : null;
  }

  async chatCompletion(input: CompletionRequest) {
    // return tempCodeString;
    // let messages: ChatCompletionRequestMessage[] = [{"role": "user", "content": "Hello!"}];
    if (!input.messages) {
      throw Error("No input messages found");
    }
    let stoparg: string | string[] = "";
    if (input.stop) {
      stoparg = input.stop;
    }
    const { data } = await this.#api.createChatCompletion({
      model: input.model,
      messages: input.messages,
      max_tokens: input.maxTokens ? input.maxTokens : 2048,
      temperature: input.temperature,
      top_p: input.topP,
      n: input.n,
      stream: false,
      stop: stoparg,
      presence_penalty: input.presencePenalty,
      frequency_penalty: input.frequencyPenalty,
      logit_bias: input.logitBias,
      user: input.user,
    });
    let fullResponse = data;
    let respText: string = data.choices[0].message?.content as string;
    return { fullResponse: fullResponse, data: respText };
    // return data.choices[0].text ? data.choices[0].text : null;
  }

  public checkAndPopulateCompletionParams(
    prompt: string | null,
    messages: Array<ChatCompletionRequestMessage> | null,
    inputParams?: { [key: string]: any }
  ): CompletionRequest {
    let model =
      (inputParams?.model as string) || this.defaultChatCompletionModel;
    let chatModel = this.checkEnumValue(model);

    return checkAndPopulateCompletionParams(
      this.defaultChatCompletionModel,
      prompt,
      messages,
      inputParams,
      !!chatModel
    );
  }
}
