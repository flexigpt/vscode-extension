import * as vscode from "vscode";

import OpenAIAPIProvider from "aiprovider/openaiapi";
import Providers, { CompletionProvider } from "aiprovider/strategy";
import { AnthropicAPI } from "aiprovider/anthropic";
import { HuggingFaceAPI } from "aiprovider/huggingface";
import { GoogleGenerativeLanguageAPI } from "aiprovider/googleapis";
import { LlamaCPPAPIProvider } from "aiprovider/llamacpp";
import log from "./logger/log";

export function getOpenAIProvider(
  config: vscode.WorkspaceConfiguration
): CompletionProvider | null {
  const apiKey = (config.get("openai.apiKey") as string) || "";
  const timeout = (config.get("openai.timeout") as number) || 120;
  const defaultCompletionModel =
    (config.get("openai.defaultCompletionModel") as string) || "gpt-3.5-turbo";
  const defaultChatCompletionModel =
    (config.get("openai.defaultChatCompletionModel") as string) ||
    "gpt-3.5-turbo";
  const defaultOrigin =
    (config.get("openai.defaultOrigin") as string) || "https://api.openai.com";

  if (apiKey) {
    log.info("OpenAI API provider initialized");
    return new OpenAIAPIProvider(
      apiKey,
      timeout,
      defaultCompletionModel,
      defaultChatCompletionModel,
      defaultOrigin
    );
  }
  log.info("OpenAI API provider not initialized, no apikey");
  return null;
}

export function getAnthropicProvider(
  config: vscode.WorkspaceConfiguration
): CompletionProvider | null {
  const apiKey = (config.get("anthropic.apiKey") as string) || "";
  const timeout = (config.get("anthropic.timeout") as number) || 120;
  const defaultCompletionModel =
    (config.get("anthropic.defaultCompletionModel") as string) || "claude-2";
  const defaultChatCompletionModel =
    (config.get("anthropic.defaultChatCompletionModel") as string) ||
    "claude-2";
  const defaultOrigin =
    (config.get("anthropic.defaultOrigin") as string) ||
    "https://api.anthropic.com";

  if (apiKey) {
    log.info("Anthropic API provider initialized");

    return new AnthropicAPI(
      apiKey,
      timeout,
      defaultCompletionModel,
      defaultChatCompletionModel,
      defaultOrigin
    );
  }
  log.info("Anthropic API provider not initialized, no apikey");
  return null;
}

export function getHuggingFaceProvider(
  config: vscode.WorkspaceConfiguration
): CompletionProvider | null {
  const apiKey = (config.get("huggingface.apiKey") as string) || "";
  const timeout = (config.get("huggingface.timeout") as number) || 120;
  const defaultCompletionModel =
    (config.get("huggingface.defaultCompletionModel") as string) ||
    "bigcode/starcoderbase";
  const defaultChatCompletionModel =
    (config.get("huggingface.defaultChatCompletionModel") as string) ||
    "microsoft/DialoGPT-large";
  const defaultOrigin =
    (config.get("huggingface.defaultOrigin") as string) ||
    "https://api-inference.huggingface.co";

  if (apiKey) {
    log.info("HuggingFace API provider initialized");
    return new HuggingFaceAPI(
      apiKey,
      timeout,
      defaultCompletionModel,
      defaultChatCompletionModel,
      defaultOrigin
    );
  }
  log.info("HuggingFace API provider not initialized, no apikey");
  return null;
}

export function getGoogleGenerativeLanguageProvider(
  config: vscode.WorkspaceConfiguration
): CompletionProvider | null {
  const apiKey = (config.get("googlegl.apiKey") as string) || "";
  const timeout = (config.get("googlegl.timeout") as number) || 120;
  const defaultCompletionModel =
    (config.get("googlegl.defaultCompletionModel") as string) ||
    "text-bison-001";
  const defaultChatCompletionModel =
    (config.get("googlegl.defaultChatCompletionModel") as string) ||
    "chat-bison-001";
  const defaultOrigin =
    (config.get("googlegl.defaultOrigin") as string) ||
    "https://generativelanguage.googleapis.com";

  if (apiKey) {
    log.info("GoogleGenerativeLanguage API provider initialized");
    return new GoogleGenerativeLanguageAPI(
      apiKey,
      timeout,
      defaultCompletionModel,
      defaultChatCompletionModel,
      defaultOrigin
    );
  }
  log.info("GoogleGenerativeLanguage API provider not initialized, no apikey");
  return null;
}

export function getLlamaCPPAPIProvider(
  config: vscode.WorkspaceConfiguration
): CompletionProvider | null {
  const apiKey = (config.get("llamacpp.apiKey") as string) || "";
  const timeout = (config.get("llamacpp.timeout") as number) || 120;
  // const defaultCompletionModel =
  //   (config.get("llamacpp.defaultCompletionModel") as string) || "llama2";
  // const defaultChatCompletionModel =
  //   (config.get("llamacpp.defaultChatCompletionModel") as string) ||
  //   "llama2";
  const defaultOrigin =
    (config.get("llamacpp.defaultOrigin") as string) || "http://127.0.0.1:8080";

  log.info("LlamaCPP API provider initialized");
  return new LlamaCPPAPIProvider(
    apiKey,
    timeout,
    "llama2",
    "llama2",
    defaultOrigin
  );
}

export function getAllProviders(): Providers {
  const config = vscode.workspace.getConfiguration("flexigpt");
  const defaultProvider = config.get("defaultProvider") as string;
  const providers: Providers = new Providers(defaultProvider);
  const op = getOpenAIProvider(config);
  if (op) {
    providers.addProvider("openai", op);
  }
  const ap = getAnthropicProvider(config);
  if (ap) {
    providers.addProvider("anthropic", ap);
  }
  const hp = getHuggingFaceProvider(config);
  if (hp) {
    providers.addProvider("huggingface", hp);
  }
  const gp = getGoogleGenerativeLanguageProvider(config);
  if (gp) {
    providers.addProvider("googlegl", gp);
  }
  const lp = getLlamaCPPAPIProvider(config);
  if (lp) {
    providers.addProvider("llamacpp", lp);
  }
  return providers;
}
