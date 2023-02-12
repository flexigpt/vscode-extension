import * as vscode from "vscode";
import log from "./logger/log";

import { systemVariableNames } from "./vscodeutils/predefinedvariables";
import ChatViewProvider from "./webviewprovider";

import { Variable } from "./promptimporter/promptvariables";
import { getOpenAIProvider } from "./setupstrategy";
import { setupCommandRunnerContext } from "./setupcommandrunner";

function registerWebView(
  context: vscode.ExtensionContext,
  provider: ChatViewProvider
) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ChatViewProvider.viewType,
      provider,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )
  );
}

function registerCommands(
  context: vscode.ExtensionContext,
  provider: ChatViewProvider
) {
  const commandAsk = vscode.commands.registerCommand(
    "flexigpt.ask",
    async () => {
      provider.importAllFiles();
      provider.setFocus();
    }
  );

  const commadFocus = vscode.commands.registerCommand("flexigpt.focus", () => {
    if (!provider._view) {
      vscode.commands.executeCommand("workbench.view.flexigpt.chatView");
    }
    provider._view?.webview.postMessage({ type: "focus" });
  });

  context.subscriptions.push(commandAsk, commadFocus);
  // context.subscriptions.push(commandAsk);
}

function registerEvents(
  context: vscode.ExtensionContext,
  provider: ChatViewProvider
) {
  // Change the extension's openai token when configuration is changed
  vscode.workspace.onDidChangeConfiguration(
    (event: vscode.ConfigurationChangeEvent) => {
      if (event.affectsConfiguration("flexigpt.promptFiles")) {
        provider.importAllFiles();
      } else if (event.affectsConfiguration("flexigpt.openai.timeout")) {
        // add the new token to the provider
        const apiProvider = getOpenAIProvider();
        provider.setAPIProvider(apiProvider);
      } else if (event.affectsConfiguration("flexigpt.openai.apiKey")) {
        // add the new token to the provider
        const apiProvider = getOpenAIProvider();
        provider.setAPIProvider(apiProvider);
      } else if (event.affectsConfiguration("flexigpt.openai.defaultCompletionModel")) {
        // add the new token to the provider
        const apiProvider = getOpenAIProvider();
        provider.setAPIProvider(apiProvider);
      } else if (event.affectsConfiguration("flexigpt.openai.defaultEditModel")) {
        // add the new token to the provider
        const apiProvider = getOpenAIProvider();
        provider.setAPIProvider(apiProvider);
      }    
    }
  );
}

export function activate(context: vscode.ExtensionContext) {
  // Create a new OpenAIAPIStrategyProvider instance and register it with the extension's context
  const apiProvider = getOpenAIProvider();
  const provider = new ChatViewProvider(context.extensionUri, context);
  provider.setAPIProvider(apiProvider);
  let commandRunnerContext = setupCommandRunnerContext(context);
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.extensionUri, context.extensionUri)
  );
  provider.setCommandRunnerContext(commandRunnerContext);
  registerCommands(context, provider);
  registerEvents(context, provider);
  registerWebView(context, provider);
  provider.importAllFiles();
  log.info("FlexiGPT is now active!");
}

// This method is called when your extension is deactivated
export function deactivate() {}
