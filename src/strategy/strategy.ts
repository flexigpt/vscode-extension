import {
  ChatCompletionRequestMessage,
  CompletionRequest,
} from "./conversationspec";

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
    let huggingfaceModels = [
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

    throw new Error(
      "No default provider and No provider found for model " + model
    );
  }
}
