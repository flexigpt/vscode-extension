import * as vscode from "vscode";

import OpenAIAPIStrategy from "./strategy/openaiapi";
import Provider from "./strategy/strategy";

export function getOpenAIProvider(): Provider {
  const config = vscode.workspace.getConfiguration("flexigpt");
  const apiKey = (config.get("openai.apiKey") as string) || "";
  const defaultCompletionModel = (config.get("openai.defaultCompletionModel") as string) || "text-davinci-003";
  const defaultEditModel = (config.get("openai.defaultEdtModel") as string) || "code-davinci-edit-001";
  const timeout = (config.get("openai.timeout") as BigInt) || 60;

  if (apiKey) {
    return new Provider(new OpenAIAPIStrategy(apiKey, timeout, defaultCompletionModel, defaultEditModel));
  }

  throw new Error("You must set an `apiKey` for OpenAI APIs");
}
