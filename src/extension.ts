import * as vscode from "vscode";
import log, { setOutputChannel } from "./logger/log";

import { systemVariableNames } from "./promptimporter/predefinedvariables";
import ChatViewProvider from "./webviewprovider";

import { Variable } from "./promptdef/promptvariables";
import { getAllProviders } from "./strategy/setupstrategy";
import { setupCommandRunnerContext } from "./promptimporter/setupcommandrunner";
import { getActiveLine } from "./vscodeutils/vscodefunctions";
import { executeSearch } from "./stackoverflow/search";

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

  const commandGetCode = vscode.commands.registerCommand(
    "flexigpt.getcode",
    () => {
      provider.getCodeUsingComment();
    }
  );

  const commadFocus = vscode.commands.registerCommand("flexigpt.focus", () => {
    if (!provider._view) {
      vscode.commands.executeCommand("workbench.view.flexigpt.chatView");
    }
    provider._view?.webview.postMessage({ type: "focus" });
  });

  const searchWithPrompt = vscode.commands.registerCommand('flexigpt.stackoverflow-search', async () => {
      const selectedLine = getActiveLine();
      let inline = '';
      if (selectedLine && selectedLine.trim() !== '') {
        inline = selectedLine;
      }
      
      const searchTerm = await vscode.window.showInputBox({
          ignoreFocusOut: inline === '',
          placeHolder: 'Enter your Stack Overflow search query',
          prompt: 'Search Stack Overflow',
          value: inline,
          valueSelection: [0, inline.length + 1],
      });

      if (!searchTerm) {
          return;
      } else {
        await executeSearch(searchTerm);
      }
  });

  const commandRunCLI = vscode.commands.registerCommand(
    "flexigpt.runcli",
    async () => {
      provider.importAllPromptFiles();
      provider.runCLIOptions();
    }
  );

  context.subscriptions.push(commandAsk, commadFocus, commandGetCode, searchWithPrompt, commandRunCLI);
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
        event.affectsConfiguration(
          "flexigpt.openai.defaultOrigin"
        ) ||
        event.affectsConfiguration("flexigpt.anthropic.timeout") ||
        event.affectsConfiguration("flexigpt.anthropic.apiKey") ||
        event.affectsConfiguration(
          "flexigpt.anthropic.defaultCompletionModel"
        ) ||
        event.affectsConfiguration(
          "flexigpt.anthropic.defaultChatCompletionModel"
        ) ||
        event.affectsConfiguration(
          "flexigpt.anthropic.defaultOrigin"
        ) ||
        event.affectsConfiguration("flexigpt.huggingface.timeout") ||
        event.affectsConfiguration("flexigpt.huggingface.apiKey") ||
        event.affectsConfiguration(
          "flexigpt.huggingface.defaultCompletionModel"
        ) ||
        event.affectsConfiguration(
          "flexigpt.huggingface.defaultChatCompletionModel"
        ) ||
        event.affectsConfiguration(
          "flexigpt.huggingface.defaultOrigin"
        ) ||
        event.affectsConfiguration("flexigpt.googlegl.timeout") ||
        event.affectsConfiguration("flexigpt.googlegl.apiKey") ||
        event.affectsConfiguration(
          "flexigpt.googlegl.defaultCompletionModel"
        ) ||
        event.affectsConfiguration(
          "flexigpt.googlegl.defaultChatCompletionModel"
        ) ||
        event.affectsConfiguration(
          "flexigpt.googlegl.defaultOrigin"
        ) ||
        event.affectsConfiguration("flexigpt.llamacpp.timeout") ||
        event.affectsConfiguration("flexigpt.llamacpp.apiKey") ||
        event.affectsConfiguration(
          "flexigpt.llamacpp.defaultOrigin"
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
  const outputChannel = vscode.window.createOutputChannel('FlexiGPT');
  setOutputChannel(outputChannel);
  context.subscriptions.push(outputChannel);
  
  const apiProviders = getAllProviders();
  const provider = new ChatViewProvider(context.extensionUri, context);
  provider.setAPIProviders(apiProviders);
  const commandRunnerContext = setupCommandRunnerContext(context);
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
// export function deactivate() {}

// INTERNAL TODOS:
// - Args in command prompts as input
// - Changelog prompt betterment after args are done.
// - Add functionality to discover tags and then use them to generate change logs. Better to have ability to edit tags as well.
// - Encorporate changelog additions in publishing workflow?
