export enum ChatCompletionRoleEnum {
  system = "system",
  user = "user",
  assistant = "assistant",
  function = "function",
}

export interface IMessage {
  id: string;
  createdAt?: Date;
  
  role: ChatCompletionRoleEnum;
  content: string;
  timestamp?: string;
  name?: string;
}

export interface IView {
  type: string;
  value: string;
  id: string;
  full: string;
  params?: { [key: string]: any };
}

/**
 *
 * @export
 * @interface ChatCompletionFunctions
 */
export interface ChatCompletionFunctions {
  /**
   * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.
   * @type {string}
   * @memberof ChatCompletionFunctions
   */
  name: string;
  /**
   * The description of what the function does.
   * @type {string}
   * @memberof ChatCompletionFunctions
   */
  description?: string;
  /**
   * The parameters the functions accepts, described as a JSON Schema object.
   * @type {{ [key: string]: any; }}
   * @memberof ChatCompletionFunctions
   */
  parameters?: { [key: string]: any };
}

/**
 * The name and arguments of a function that should be called, as generated by the model.
 * @export
 * @interface ChatCompletionRequestMessageFunctionCall
 */
export interface ChatCompletionRequestMessageFunctionCall {
  /**
   * The name of the function to call.
   * @type {string}
   * @memberof ChatCompletionRequestMessageFunctionCall
   */
  name?: string;
  /**
   * The arguments to call the function with, as generated by the model in JSON format. Note that the model does not always generate valid JSON, and may hallucinate parameters not defined by your function schema. Validate the arguments in your code before calling your function.
   * @type {string}
   * @memberof ChatCompletionRequestMessageFunctionCall
   */
  arguments?: string;
}

/**
 *
 * @export
 * @interface ChatCompletionRequestMessage
 */
export interface ChatCompletionRequestMessage {
  /**
   * The role of the author of this message.
   * @type {string}
   * @memberof ChatCompletionRequestMessage
   */
  role: ChatCompletionRoleEnum;
  /**
   * The contents of the message
   * @type {string}
   * @memberof ChatCompletionRequestMessage
   */
  content?: string;
  /**
   * The name of the user in a multi-user chat
   * @type {string}
   * @memberof ChatCompletionRequestMessage
   */
  name?: string;
  /**
   *
   * @type {ChatCompletionRequestMessageFunctionCall}
   * @memberof ChatCompletionRequestMessage
   */
  functionCall?: ChatCompletionRequestMessageFunctionCall;
}

/**
 *
 * @export
 * @interface ChatCompletionResponseMessage
 */
export interface ChatCompletionResponseMessage {
  /**
   * The role of the author of this message.
   * @type {string}
   * @memberof ChatCompletionResponseMessage
   */
  role: ChatCompletionRoleEnum;
  /**
   * The contents of the message
   * @type {string}
   * @memberof ChatCompletionResponseMessage
   */
  content?: string;
  /**
   *
   * @type {ChatCompletionRequestMessageFunctionCall}
   * @memberof ChatCompletionResponseMessage
   */
  functionCall?: ChatCompletionRequestMessageFunctionCall;
}

/**
 * @type CreateChatCompletionRequestFunctionCall
 * Controls how the model responds to function calls. \"none\" means the model does not call a function, and responds to the end-user. \"auto\" means the model can pick between an end-user or calling a function.  Specifying a particular function via `{\"name\":\\ \"my_function\"}` forces the model to call that function. \"none\" is the default when no functions are present. \"auto\" is the default if functions are present.
 * @export
 */
export type CreateChatCompletionRequestFunctionCall =
  | CreateChatCompletionRequestFunctionCallOneOf
  | string;

/**
 *
 * @export
 * @interface CreateChatCompletionRequestFunctionCallOneOf
 */
export interface CreateChatCompletionRequestFunctionCallOneOf {
  /**
   * The name of the function to call.
   * @type {string}
   * @memberof CreateChatCompletionRequestFunctionCallOneOf
   */
  name: string;
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
   * A list of functions the model may generate JSON inputs for.
   * @type {Array<ChatCompletionFunctions>}
   * @memberof CreateChatCompletionRequest
   */
  functions?: Array<ChatCompletionFunctions>;
  /**
   *
   * @type {CreateChatCompletionRequestFunctionCall}
   * @memberof CreateChatCompletionRequest
   */
  functionCall?: CreateChatCompletionRequestFunctionCall;
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
  /**
   *  Map of additional parameters specific to the model.
   *  @type {Record<string, any>}
   *  Anything with non null/undefined value will be added to the request body
   */
  additionalParameters?: Record<string, any> | null;
}



export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: IMessage[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>