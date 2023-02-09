import * as vscode from "vscode";
import log from "./logger/log";

import { systemVariableNames } from "./vscodeutils/predefinedvariables";
import ChatViewProvider from "./webviewprovider";

import {
  DEFAULT_ASK_ANYTHING,
  CommandRunnerContext,
} from "./promptimporter/promptcommands";
import { Variable } from "./promptimporter/promptvariables";

import {
  getOpenAIProvider,
  importPrompts,
  importAllPrompts,
  setupCommandRunnerContext,
} from "./setup";

function registerWebView(
  context: vscode.ExtensionContext,
  provider: ChatViewProvider,
  commandRunnerContext: CommandRunnerContext
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
  provider: ChatViewProvider,
  commandRunnerContext: CommandRunnerContext
) {
  const commandAsk = vscode.commands.registerCommand(
    "flexigpt.ask",
    async () => {
      commandRunnerContext.setSystemVariable(
        new Variable(systemVariableNames.extensionUri, context.extensionUri)
      );

      let commandList = commandRunnerContext.getCommands().map((c) => ({
        label: c.name,
        description: c.description,
        command: c,
      }));

      log.info(`Commands: ${commandList}`);

      let selectedCommand = await vscode.window.showQuickPick(commandList, {
        title: "Select a FlexiGPT prompt",
        matchOnDescription: true,
        matchOnDetail: true,
      });
      if (selectedCommand) {
        if (selectedCommand.label === DEFAULT_ASK_ANYTHING) {
          vscode.window
            .showInputBox({ prompt: "What do you want to ask?" })
            .then((value) => {
              provider.search(value as string);
            });
        } else {
          const question = commandRunnerContext.prepareAndSetCommand(
            selectedCommand?.command.name
          );
          const answer = provider.search(question);
          if (!answer) {
            throw Error("Could not get response from Provider.");
          }
          // c.setSystemVariable(
          //   new Variable(systemVariableNames.answer, answer.fullText)
          // );
          // c.setSystemVariable(
          //   new Variable(systemVariableNames.answerCode, answer.code)
          // );
          // c.runHandler(command.handler);
        }
      }
    }
  );

  const commadFocus = vscode.commands.registerCommand('flexigpt.focus', () => {
    log.info("reached on focus");
    if (!provider._view) {
        vscode.commands.executeCommand("workbench.view.flexigpt.chatView");
    }
    provider._view?.webview.postMessage({ command: 'focus' });
  });

  context.subscriptions.push(commandAsk, commadFocus);
}

function registerEvents(
  context: vscode.ExtensionContext,
  provider: ChatViewProvider,
  commandRunnerContext: CommandRunnerContext
) {
  // Change the extension's openai token when configuration is changed
  vscode.workspace.onDidChangeConfiguration(
    (event: vscode.ConfigurationChangeEvent) => {
      if (event.affectsConfiguration("flexigpt.openai.apiKey")) {
        // add the new token to the provider
        const apiProvider = getOpenAIProvider();
        provider.setAPIProvider(apiProvider);
      } else if (event.affectsConfiguration("flexigpt.openai.timeout")) {
        // add the new token to the provider
        const apiProvider = getOpenAIProvider();
        provider.setAPIProvider(apiProvider);
      } else if (event.affectsConfiguration("flexigpt.promptFiles")) {
        const config = vscode.workspace.getConfiguration("flexigpt");
        const promptFiles = config.get("promptFiles") as string | "";
        importPrompts(promptFiles, commandRunnerContext);
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
  importAllPrompts(context, commandRunnerContext);

  registerCommands(context, provider, commandRunnerContext);
  registerEvents(context, provider, commandRunnerContext);
  registerWebView(context, provider, commandRunnerContext);
}

// This method is called when your extension is deactivated
export function deactivate() {}