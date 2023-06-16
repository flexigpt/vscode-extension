import { ChatCompletionRequestMessage } from "./conversationspec";

export interface CompletionProvider {
  completion(
    input: CompletionRequest
  ): Promise<{ fullResponse: any; data: string | null }>;
  chatCompletion(
    input: CompletionRequest
  ): Promise<{ fullResponse: any; data: string | null }>;
  checkAndPopulateCompletionParams(
    prompt: string | null,
    messages: Array<ChatCompletionRequestMessage> | null,
    inputParams?: { [key: string]: any }
  ): CompletionRequest;
}

export default class Providers {
  public defaultProvider: string;
  public providers: { [key: string]: CompletionProvider } = {};

  constructor(defaultProvider: string) {
    this.defaultProvider = defaultProvider;
  }

  public addProvider(name: string, provider: CompletionProvider | null) {
    if (!provider) {
      throw new Error("Provider cannot be null");
    }
    this.providers[name] = provider;
    if (!this.defaultProvider || this.defaultProvider === "") {
      this.defaultProvider = name;
    }
  }

  public getProvider(
    model: string,
    providerName: string = ""
  ): CompletionProvider {
    if (providerName && providerName !== "" && this.providers[providerName]) {
      return this.providers[providerName];
    }
    if (!model || model === "") {
      if (this.defaultProvider && this.defaultProvider !== "") {
        return this.providers[this.defaultProvider];
      }
      throw new Error("No default provider and No model as input");
    }

    let openAIModels = [
      "text-davinci-003, text-davinci-002, davinci, curie, babbage, ada",
      "gpt-4",
      "gpt-3.5-turbo",
    ];
    if (
      openAIModels.some((search) => model.startsWith(search)) &&
      this.providers.openai
    ) {
      return this.providers.openai;
    }
    let anthropicModels = ["claude"];
    if (
      anthropicModels.some((search) => model.startsWith(search)) &&
      this.providers.anthropic
    ) {
      return this.providers.anthropic;
    }
    let googleglModels = ["bison", "gecko"];
    if (
      googleglModels.some((search) => model.includes(search)) &&
      this.providers.googlegl
    ) {
      return this.providers.googlegl;
    }
    let huggingfaceModels = ["microsoft/", "replit/", "Salesforce/", "bigcode/"];
    if (
      huggingfaceModels.some((search) => model.startsWith(search)) &&
      this.providers.huggingface
    ) {
      return this.providers.huggingface;
    }
    // No provider was given and input model didnt match any known models, but has slash in it, so assume its a huggingface model
    if (model.includes("/")) {
      return this.providers.huggingface;
    }

    throw new Error(
      "No default provider and No provider found for model " + model
    );
  }
}

/**
 *
 * @export
 * @interface CompletionRequest
 */
export interface CompletionRequest {
  /**
   * ID of the model to use. You can use the [List models](/docs/api-reference/models/list) API to see all of your available models, or see our [Model overview](/docs/models/overview) for descriptions of them.
   * @type {string}
   * @memberof CompletionRequest
   */
  model: string;
  /**
   *
   * @type {string}
   * @memberof CompletionRequest
   */
  prompt?: string | null;
  /**
   * The messages to generate chat completions for, in the [chat format](/docs/guides/chat/introduction).
   * @type {Array<ChatCompletionRequestMessage>}
   * @memberof CreateChatCompletionRequest
   */
  messages?: Array<ChatCompletionRequestMessage> | null;
  /**
   * The suffix that comes after a completion of inserted text.
   * @type {string}
   * @memberof CompletionRequest
   */
  suffix?: string | null;
  /**
   * The maximum number of [tokens](/tokenizer) to generate in the completion.  The token count of your prompt plus `max_tokens` cannot exceed the model\'s context length. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
   * @type {number}
   * @memberof CompletionRequest
   */
  maxTokens?: number | null;
  /**
   * What [sampling temperature](https://towardsdatascience.com/how-to-sample-from-language-models-682bceb97277) to use. Higher values means the model will take more risks. Try 0.9 for more creative applications, and 0 (argmax sampling) for ones with a well-defined answer.  We generally recommend altering this or `top_p` but not both.
   * @type {number}
   * @memberof CompletionRequest
   */
  temperature?: number | null;
  /**
   * An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.  We generally recommend altering this or `temperature` but not both.
   * @type {number}
   * @memberof CompletionRequest
   */
  topP?: number | null;
  /**
   * How many completions to generate for each prompt.  **Note:** Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for `max_tokens` and `stop`.
   * @type {number}
   * @memberof CompletionRequest
   */
  n?: number | null;
  /**
   * Whether to stream back partial progress. If set, tokens will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available, with the stream terminated by a `data: [DONE]` message.
   * @type {boolean}
   * @memberof CompletionRequest
   */
  stream?: boolean | null;
  /**
   * Include the log probabilities on the `logprobs` most likely tokens, as well the chosen tokens. For example, if `logprobs` is 5, the API will return a list of the 5 most likely tokens. The API will always return the `logprob` of the sampled token, so there may be up to `logprobs+1` elements in the response.  The maximum value for `logprobs` is 5. If you need more than this, please contact us through our [Help center](https://help.openai.com) and describe your use case.
   * @type {number}
   * @memberof CompletionRequest
   */
  logprobs?: number | null;
  /**
   * Echo back the prompt in addition to the completion
   * @type {boolean}
   * @memberof CompletionRequest
   */
  echo?: boolean | null;
  /**
   *
   * @type {string}
   * @memberof CompletionRequest
   */
  stop?: string | string[] | null;
  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model\'s likelihood to talk about new topics.  [See more information about frequency and presence penalties.](/docs/api-reference/parameter-details)
   * @type {number}
   * @memberof CompletionRequest
   */
  presencePenalty?: number | null;
  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.  [See more information about frequency and presence penalties.](/docs/api-reference/parameter-details)
   * @type {number}
   * @memberof CompletionRequest
   */
  frequencyPenalty?: number | null;
  /**
   * Generates `best_of` completions server-side and returns the \"best\" (the one with the highest log probability per token). Results cannot be streamed.  When used with `n`, `best_of` controls the number of candidate completions and `n` specifies how many to return – `best_of` must be greater than `n`.  **Note:** Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for `max_tokens` and `stop`.
   * @type {number}
   * @memberof CompletionRequest
   */
  bestOf?: number | null;
  /**
   * Modify the likelihood of specified tokens appearing in the completion.  Accepts a json object that maps tokens (specified by their token ID in the GPT tokenizer) to an associated bias value from -100 to 100. You can use this [tokenizer tool](/tokenizer?view=bpe) (which works for both GPT-2 and GPT-3) to convert text to token IDs. Mathematically, the bias is added to the logits generated by the model prior to sampling. The exact effect will vary per model, but values between -1 and 1 should decrease or increase likelihood of selection; values like -100 or 100 should result in a ban or exclusive selection of the relevant token.  As an example, you can pass `{\"50256\": -100}` to prevent the <|endoftext|> token from being generated.
   * @type {object}
   * @memberof CompletionRequest
   */
  logitBias?: object | null;
  /**
   * A unique identifier representing your end-user, which will help OpenAI to monitor and detect abuse. [Learn more](/docs/usage-policies/end-user-ids).
   * @type {string}
   * @memberof CompletionRequest
   */
  user?: string;
  /**
   * The amount of time in seconds that the query should take maximum. May or may not be enforceable.
   * @type {number}
   * @memberof CompletionRequest
   */
  timeout?: number | null;
  /**
   * Integer to define the top tokens considered within the sample operation to create new text
   * @type {number}
   * @memberof CompletionRequest
   */
  topK?: number | null;
}
