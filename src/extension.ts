import * as vscode from "vscode";
import log from "./logger/log";

import { systemVariableNames } from "./vscodeutils/predefinedvariables";
import ChatViewProvider from "./webviewprovider";

import { Variable } from "./promptimporter/promptvariables";
import { getAllProviders } from "./setupstrategy";
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
      provider.importAllPromptFiles();
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
        provider.importAllPromptFiles();
      } else if (event.affectsConfiguration("flexigpt.inBuiltPrompts")) {
        provider.importAllPromptFiles();
      } else if (
        event.affectsConfiguration("flexigpt.defaultProvider") ||
        event.affectsConfiguration("flexigpt.openai.timeout") ||
        event.affectsConfiguration("flexigpt.openai.apiKey") ||
        event.affectsConfiguration("flexigpt.openai.defaultCompletionModel") ||
        event.affectsConfiguration(
          "flexigpt.openai.defaultChatCompletionModel"
        ) ||
        event.affectsConfiguration("flexigpt.openai.defaultEditModel") ||
        event.affectsConfiguration("flexigpt.anthropic.timeout") ||
        event.affectsConfiguration("flexigpt.anthropic.apiKey") ||
        event.affectsConfiguration(
          "flexigpt.anthropic.defaultCompletionModel"
        ) ||
        event.affectsConfiguration(
          "flexigpt.anthropic.defaultChatCompletionModel"
        ) ||
        event.affectsConfiguration("flexigpt.huggingface.timeout") ||
        event.affectsConfiguration("flexigpt.huggingface.apiKey") ||
        event.affectsConfiguration(
          "flexigpt.huggingface.defaultCompletionModel"
        ) ||
        event.affectsConfiguration(
          "flexigpt.huggingface.defaultChatCompletionModel"
        )
      ) {
        // add the new token to the provider
        const apiProviders = getAllProviders();
        provider.setAPIProviders(apiProviders);
      }
    }
  );
}

export function activate(context: vscode.ExtensionContext) {
  const apiProviders = getAllProviders();
  const provider = new ChatViewProvider(context.extensionUri, context);
  provider.setAPIProviders(apiProviders);
  let commandRunnerContext = setupCommandRunnerContext(context);
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.extensionUri, context.extensionUri)
  );
  provider.setCommandRunnerContext(commandRunnerContext);
  registerCommands(context, provider);
  registerEvents(context, provider);
  registerWebView(context, provider);
  provider.importConversations();
  provider.importAllPromptFiles();
  log.info("FlexiGPT is now active!");
}

// This method is called when your extension is deactivated
export function deactivate() {}

// INTERNAL TODOS:
// - Args in command prompts as input
// - Changelog prompt betterment after args are done.
// - Add functionality to discover tags and then use them to generate change logs. Better to have ability to edit tags as well.
// - Encorporate changelog additions in publishing workflow?
