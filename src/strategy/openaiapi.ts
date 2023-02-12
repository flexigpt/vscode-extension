import { Configuration, CreateImageRequest, OpenAIApi } from "openai";
import { CompletionRequest, EditRequest, Strategy } from "./strategy";
import { unescapeChars } from "./regexmatcher";

export default class OpenAIAPIStrategy implements Strategy {
  #api: OpenAIApi;
  #timeout: BigInt;
  defaultCompletionModel: string;
  defaultEditModel: string;

  constructor(
    apiKey: string,
    timeout: BigInt,
    defaultCompletionModel: string = "text-davinci-003",
    defaultEditModel: string = "code-davinci-edit-001"
  ) {
    const configuration = new Configuration({ apiKey: apiKey });
    this.#api = new OpenAIApi(configuration);
    this.#timeout = timeout;
    this.defaultCompletionModel = defaultCompletionModel;
    this.defaultEditModel = defaultEditModel;
  }

  async completion(input: CompletionRequest) {
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
    // return data.choices[0].text ? unescapeChars(data.choices[0].text) : null;
    return data.choices[0].text ? data.choices[0].text : null;
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
      suffix: inputParams?.suffix || undefined,
      maxTokens: (inputParams?.maxTokens as number) || 1024,
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
