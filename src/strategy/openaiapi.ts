import log from "../logger/log";
import { Configuration, OpenAIApi , CreateChatCompletionRequestStop} from "openai";
import { ChatCompletionRequestMessage, CompletionRequest, EditRequest, Strategy } from "./strategy";
import { unescapeChars } from "./regexmatcher";

let tempCodeString = `def get_openapi_completion_for_integration_sequence_test(intxt, value_type):
response = openai.Completion.create(
    model="text-davinci-003",
    prompt=prompts.generate_prompt_integration_sequence_test(intxt, value_type),
    temperature=0,
    max_tokens=2560,
    best_of=1,
    stop=["##", "}}}}}}", "Generate workflow", "func Test"])

return response`;

let promptProcessorString = "convert the response after processing previous prompt to a html code that highlights code elements using highlight.js"

export default class OpenAIAPIStrategy implements Strategy {
  #api: OpenAIApi;
  #timeout: BigInt;
  defaultCompletionModel: string;
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
    this.defaultEditModel = defaultEditModel;
  }

  async completion(input: CompletionRequest) {
    // return tempCodeString;
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
    return {fullResponse: data, data: data.choices[0].text ? unescapeChars(data.choices[0].text) : ""};
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
    return {fullResponse: fullResponse, data: respText};
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
      model: this.defaultCompletionModel,
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
    prompt: string,
    inputParams?: { [key: string]: any }
  ): CompletionRequest {
    let completionRequest: CompletionRequest = {
      model: (inputParams?.model as string) || this.defaultCompletionModel,
      prompt: prompt,
      messages: inputParams.message;
      suffix: inputParams?.suffix || undefined,
      maxTokens: (inputParams?.maxTokens as number) || 2048,
      temperature: (inputParams?.temperature as number) || 0,
      topP: (inputParams?.topP as number) || undefined,
      n: (inputParams?.n as number) || undefined,
      stream: false,
      logprobs: (inputParams?.logprobs as number) || undefined,
      echo: (inputParams?.echo as boolean) || undefined,
      stop: inputParams?.stop || undefined,
      presencePenalty: (inputParams?.presencePenalty as number) || 0.0,
      frequencyPenalty: (inputParams?.frequencyPenalty as number) || 0.5,
      bestOf: (inputParams?.bestOf as number) || 1,
      logitBias: inputParams?.logitBias || undefined,
      user: (inputParams?.user as string) || undefined,
    };

    return completionRequest;
  }

  public checkAndPopulateEditParams(
    prompt: string,
    inputParams?: { [key: string]: any }
  ): EditRequest {
    let editRequest: EditRequest = {
      model: (inputParams?.model as string) || this.defaultEditModel,
      input: prompt,
      instruction:
        (inputParams?.instruction as string) || "Refactor this function",
      n: (inputParams?.n as number) || undefined,
      temperature: (inputParams?.temperature as number) || 0,
      topP: (inputParams?.topP as number) || undefined,
    };

    return editRequest;
  }
}
