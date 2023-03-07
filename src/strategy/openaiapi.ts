import log from "../logger/log";
import {
  Configuration,
  OpenAIApi,
  CreateChatCompletionRequestStop,
} from "openai";
import { CompletionRequest, EditRequest, Strategy } from "./strategy";

import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
} from "./conversationspec";

import { unescapeChars } from "./regexmatcher";

export const chatCompletionModelsEnum = {
  gptTurbo: "gpt-3.5-turbo",
  gptTurbo301: "gpt-3.5-turbo-0301",
};

let tempCodeString = `def get_openapi_completion_for_integration_sequence_test(intxt, value_type):
response = openai.Completion.create(
    model="text-davinci-003",
    prompt=prompts.generate_prompt_integration_sequence_test(intxt, value_type),
    temperature=0,
    max_tokens=2560,
    best_of=1,
    stop=["##", "}}}}}}", "Generate workflow", "func Test"])

return response`;

let promptProcessorString =
  "convert the response after processing previous prompt to a html code that highlights code elements using highlight.js";

export default class OpenAIAPIStrategy implements Strategy {
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
      data: data.choices[0].text ? unescapeChars(data.choices[0].text) : "",
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
    if (respText) {
      respText = unescapeChars(respText);
    }
    return { fullResponse: fullResponse, data: respText };
    // return data.choices[0].text ? data.choices[0].text : null;
  }

  async edit(input: EditRequest) {
    const { data } = await this.#api.createEdit({
      model: input.model,
      input: input.input,
      instruction: input.instruction,
      n: input.n,
      temperature: input.temperature,
      top_p: input.topP,
    });

    return data.choices[0].text ? unescapeChars(data.choices[0].text) : null;
  }

  public getDefaultCompletionCommand(prompt?: string): CompletionRequest {
    var crequest = {
      model: this.defaultChatCompletionModel,
      prompt: prompt,
      temperature: 0,
      maxTokens: 2048,
      frequencyPenalty: 0.5,
      presencePenalty: 0.0,
      bestOf: 1,
    };

    return crequest;
  }

  public getDefaultEditCommand(prompt?: string): EditRequest {
    var erequest = {
      model: this.defaultEditModel,
      input: prompt,
      temperature: 0,
      instruction: "Refactor this function",
    };

    return erequest;
  }

  public checkAndPopulateCompletionParams(
    prompt: string | null,
    messages: Array<ChatCompletionRequestMessage> | null,
    inputParams?: { [key: string]: any }
  ): CompletionRequest {
    // log.info(`Input params read: ${JSON.stringify(inputParams, null, 2)}`);
    let completionRequest: CompletionRequest = {
      model: (inputParams?.model as string) || this.defaultChatCompletionModel,
      prompt: prompt,
      messages: messages,
      suffix: inputParams?.suffix || undefined,
      maxTokens:
        inputParams?.maxTokens === 0 ? 0 : inputParams?.maxTokens || 2048,
      temperature:
        inputParams?.temperature === 0 ? 0 : inputParams?.temperature || 0.1,
      topP: inputParams?.topP === 0 ? 0 : inputParams?.topP || undefined,
      n: inputParams?.n === 0 ? 0 : inputParams?.n || undefined,
      stream: false,
      logprobs:
        inputParams?.logprobs === 0 ? 0 : inputParams?.logprobs || undefined,
      echo: (inputParams?.echo as boolean) || undefined,
      stop: inputParams?.stop || undefined,
      presencePenalty:
        inputParams?.presencePenalty === 0
          ? 0
          : inputParams?.presencePenalty || 0.0,
      frequencyPenalty:
        inputParams?.frequencyPenalty === 0
          ? 0
          : inputParams?.frequencyPenalty || 0.5,
      bestOf: inputParams?.bestOf === 0 ? 0 : inputParams?.bestOf || 1,
      logitBias: inputParams?.logitBias || undefined,
      user: (inputParams?.user as string) || undefined,
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

    let chatModel = this.checkEnumValue(completionRequest.model);
    if (chatModel) {
      completionRequest.prompt = null;
    }
    return completionRequest;
  }

  public checkAndPopulateEditParams(
    prompt: string | null,
    inputParams?: { [key: string]: any }
  ): EditRequest {
    let editRequest: EditRequest = {
      model: (inputParams?.model as string) || this.defaultEditModel,
      input: prompt,
      instruction:
        (inputParams?.instruction as string) || "Refactor this function",
      temperature:
        inputParams?.temperature === 0 ? 0 : inputParams?.temperature || 0.1,
      topP: inputParams?.topP === 0 ? 0 : inputParams?.topP || undefined,
      n: inputParams?.n === 0 ? 0 : inputParams?.n || undefined,
    };

    return editRequest;
  }
}
