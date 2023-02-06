import * as vscode from "vscode";

import { systemVariableNames } from "./vscodeutils/predefinedvariables";
import ChatViewProvider from "./webviewprovider";

import {DEFAULT_ASK_ANYTHING, Command, CommandRunnerContext } from "./promptimporter/promptcommands";
import { Variable } from "./promptimporter/promptvariables";

import {
  getOpenAIProvider,
  importPrompts,
  importAllPrompts,
  setupCommandRunnerContext,
} from "./setup";

async function runCommand(
  c: CommandRunnerContext,
  command: Command,
  provider: ChatViewProvider
): Promise<void> {
  const system = c.systemVariableContext.getVariables();
  const functions = c.functionContext.getFunctions();
  const user = c.userVariableContext.getVariables(system, functions);
  const question = command.prepare(system, user);
  c.setSystemVariable(new Variable(systemVariableNames.question, question));
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
              provider.search(value);
            });
        } else {
          await runCommand(
            commandRunnerContext,
            selectedCommand?.command,
            provider
          );
        }
      }
    }
  );

  context.subscriptions.push(commandAsk);
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
  const provider = new ChatViewProvider(context.extensionUri);
  provider.setAPIProvider(apiProvider);
  let commandRunnerContext = setupCommandRunnerContext(context);
  importAllPrompts(context, commandRunnerContext);

  registerWebView(context, provider, commandRunnerContext);
  registerCommands(context, provider, commandRunnerContext);
  registerEvents(context, provider, commandRunnerContext);
}

// This method is called when your extension is deactivated
export function deactivate() {}
