import * as vscode from "vscode";

import OpenAIAPIStrategy from "./strategy/openaiapi";
import Provider from "./strategy/strategy";

export function getOpenAIProvider(): Provider {
  const config = vscode.workspace.getConfiguration("flexigpt");
  const apiKey = (config.get("openai.apiKey") as string) || "";
  const timeout = (config.get("timeout") as BigInt) || 60;

  if (apiKey) {
    return new Provider(new OpenAIAPIStrategy(apiKey, timeout));
  }

  throw new Error("You must set an `apiKey` for OpenAI APIs");
}
