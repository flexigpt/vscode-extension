import { log } from "logger/log";
import {
  ChatCompletionRequestMessage,
  CompletionRequest,
} from "spec/chat";

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
    providerName = ""
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

    const openAIModels = [
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
    const anthropicModels = ["claude"];
    if (
      anthropicModels.some((search) => model.startsWith(search)) &&
      this.providers.anthropic
    ) {
      return this.providers.anthropic;
    }
    const googleglModels = ["bison", "gecko"];
    if (
      googleglModels.some((search) => model.includes(search)) &&
      this.providers.googlegl
    ) {
      return this.providers.googlegl;
    }
    const huggingfaceModels = [
      "microsoft/",
      "replit/",
      "Salesforce/",
      "bigcode/",
    ];
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

    if (this.defaultProvider && this.defaultProvider !== "") {
      return this.providers[this.defaultProvider];
    }
    throw new Error(
      "No default provider and No provider found for model " + model
    );
  }
}

export function unescapeChars(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function countTokensInContent(content: string): number {
  // Regular expression to split the content into tokens based on common delimiters.
  // This includes whitespaces, brackets, arithmetic operators, and punctuation.
  // eslint-disable-next-line no-useless-escape
  const tokenRegex = /[\s{}\[\]()+-=*/<>,;:.!&|\\]+/;

  // Split the content into tokens based on the regex and filter out empty strings.
  const tokens = content.split(tokenRegex).filter((token) => token !== "");

  // Return the count of tokens.
  return tokens.length;
}

export function filterMessagesByTokenCount(
  messages: ChatCompletionRequestMessage[],
  maxTokenCount: number
): ChatCompletionRequestMessage[] {
  let totalTokens = 0;
  const filteredMessages: ChatCompletionRequestMessage[] = [];

  // Loop through the messages in reverse order (prioritizing the last element)
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const c = message.content || "";
    const tokensInMessage = countTokensInContent(c);

    // Check if adding this message will not exceed maxTokenCount
    // or if the filteredMessages array is empty, then at least add this message
    if (
      totalTokens + tokensInMessage <= maxTokenCount ||
      filteredMessages.length === 0
    ) {
      filteredMessages.push(message);
      totalTokens += tokensInMessage;

      // Always include at least one message, so if we've added one we can now enforce maxTokenCount
      if (totalTokens > maxTokenCount) {
        break;
      }
    } else {
      break;
    }
  }
  if (filteredMessages.length < messages.length) {
    log.info(
      `Filtered messages count (${filteredMessages.length}) is less than input messages count (${messages.length})`
    );
  }
  return filteredMessages.reverse();
}
