import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
} from "./conversationspec";
import { CompletionRequest } from "./strategy";

export const tempCodeString = `def get_openapi_completion_for_integration_sequence_test(intxt, value_type):
response = openai.Completion.create(
    model="text-davinci-003",
    prompt=prompts.generate_prompt_integration_sequence_test(intxt, value_type),
    temperature=0,
    max_tokens=2560,
    best_of=1,
    stop=["##", "}}}}}}", "Generate workflow", "func Test"])

return response`;

export const promptProcessorString =
  "convert the response after processing previous prompt to a html code that highlights code elements using highlight.js";


const MARKDOWN_REGEX = /```[\s\S]*?```/g;
const GENERATOR_REGEX = /^\/\/ @ai.*$/gm;

export const getMarkdowns = (text: string) => {
  const markdownMatches = text.match(MARKDOWN_REGEX);

  return markdownMatches?.map((markdownMatch) => markdownMatch.slice(3, -3));
};

export const getGeneratorLines = (text: string) => {
  return text.match(GENERATOR_REGEX);
};

export const unescapeChars = (text: string) => {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
};

export function checkAndPopulateCompletionParams(
  defaultChatCompletionModel: string,
  prompt: string | null,
  messages: Array<ChatCompletionRequestMessage> | null,
  inputParams?: { [key: string]: any},
  promptNullIfMessages: boolean = true,
): CompletionRequest {
  // log.info(`Input params read: ${JSON.stringify(inputParams, null, 2)}`);
  let completionRequest: CompletionRequest = {
    model: (inputParams?.model as string) || defaultChatCompletionModel,
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
  if (promptNullIfMessages && completionRequest.messages) {
    completionRequest.prompt = null;
  }
  return completionRequest;
}
