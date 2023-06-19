import * as vscode from "vscode";

import OpenAIAPIProvider from "./openaiapi";
import Providers, { CompletionProvider } from "./strategy";
import { AnthropicAPI } from "./anthropic";
import { HuggingFaceAPI } from "./huggingface";
import { GoogleGenerativeLanguageAPI } from "./googleapis";
import log from "../logger/log";

export function getOpenAIProvider(
  config: vscode.WorkspaceConfiguration
): CompletionProvider | null {
  const apiKey = (config.get("openai.apiKey") as string) || "";
  const defaultCompletionModel =
    (config.get("openai.defaultCompletionModel") as string) || "gpt-3.5-turbo";
  const defaultChatCompletionModel =
    (config.get("openai.defaultChatCompletionModel") as string) ||
    "gpt-3.5-turbo";
  const defaultEditModel =
    (config.get("openai.defaultEditModel") as string) ||
    "code-davinci-edit-001";
  const timeout = (config.get("openai.timeout") as BigInt) || 120;

  if (apiKey) {
    log.info("OpenAI API provider initialized");
    return new OpenAIAPIProvider(
      apiKey,
      timeout,
      defaultCompletionModel,
      defaultChatCompletionModel,
      defaultEditModel
    );
  }
  log.info("OpenAI API provider not initialized, no apikey");
  return null;
}

export function getAnthropicProvider(
  config: vscode.WorkspaceConfiguration
): CompletionProvider | null {
  const apiKey = (config.get("anthropic.apiKey") as string) || "";
  const defaultCompletionModel =
    (config.get("anthropic.defaultCompletionModel") as string) || "claude-1";
  const defaultChatCompletionModel =
    (config.get("anthropic.defaultChatCompletionModel") as string) ||
    "claude-1";
  const timeout = (config.get("anthropic.timeout") as BigInt) || 120;
  if (apiKey) {
    log.info("Anthropic API provider initialized");
    return new AnthropicAPI(
      apiKey,
      timeout,
      defaultCompletionModel,
      defaultChatCompletionModel
    );
  }
  log.info("Anthropic API provider not initialized, no apikey");
  return null;
}

export function getHuggingFaceProvider(
  config: vscode.WorkspaceConfiguration
): CompletionProvider | null {
  const apiKey = (config.get("huggingface.apiKey") as string) || "";
  const defaultCompletionModel =
    (config.get("huggingface.defaultCompletionModel") as string) || "bigcode/starcoderbase";
  const defaultChatCompletionModel =
    (config.get("huggingface.defaultChatCompletionModel") as string) ||
    "microsoft/DialoGPT-large";
  const timeout = (config.get("huggingface.timeout") as BigInt) || 120;
  if (apiKey) {
    log.info("HuggingFace API provider initialized");
    return new HuggingFaceAPI(
      apiKey,
      timeout,
      defaultCompletionModel,
      defaultChatCompletionModel
    );
  }
  log.info("HuggingFace API provider not initialized, no apikey");
  return null;
}

export function getGoogleGenerativeLanguageProvider(
  config: vscode.WorkspaceConfiguration
): CompletionProvider | null {
  const apiKey = (config.get("googlegl.apiKey") as string) || "";
  const defaultCompletionModel =
    (config.get("googlegl.defaultCompletionModel") as string) || "text-bison-001";
  const defaultChatCompletionModel =
    (config.get("googlegl.defaultChatCompletionModel") as string) ||
    "chat-bison-001";
  const timeout = (config.get("googlegl.timeout") as BigInt) || 120;
  if (apiKey) {
    log.info("GoogleGenerativeLanguage API provider initialized");
    return new GoogleGenerativeLanguageAPI(
      apiKey,
      timeout,
      defaultCompletionModel,
      defaultChatCompletionModel
    );
  }
  log.info("GoogleGenerativeLanguage API provider not initialized, no apikey");
  return null;
}

export function getAllProviders(): Providers {
  const config = vscode.workspace.getConfiguration("flexigpt");
  const defaultProvider = config.get("defaultProvider") as string;
  let providers: Providers = new Providers(defaultProvider);
  let op = getOpenAIProvider(config);
  if (op) {
    providers.addProvider("openai", op);
  }
  let ap = getAnthropicProvider(config);
  if (ap) {
    providers.addProvider("anthropic", ap);
  }
  let hp = getHuggingFaceProvider(config);
  if (hp) {
    providers.addProvider("huggingface", hp);
  }
  let gp = getGoogleGenerativeLanguageProvider(config);
  if (gp) {
    providers.addProvider("googlegl", gp);
  }
  return providers;
}
