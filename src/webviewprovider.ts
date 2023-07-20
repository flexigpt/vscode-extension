import * as vscode from "vscode";
import * as path from "path";

import * as prettier from "prettier";
import { v4 as uuidv4 } from "uuid";

import Providers, { CompletionProvider } from "./strategy/strategy";
import { filterSensitiveInfoFromJsonString } from "./strategy/api";

import log from "./logger/log";

import { importAllPrompts } from "./promptimporter/setupprompts";
import { getAllProviders } from "./strategy/setupstrategy";
import { CommandRunnerContext } from "./promptimporter/promptcommandrunner";
import { systemVariableNames } from "./promptimporter/predefinedvariables";
import {
  append,
  getActiveDocumentFilePath,
  getActiveDocumentLanguageID,
  getActiveLine,
  runCommandInShell,
} from "./vscodeutils/vscodefunctions";
import {
  ConversationCollection,
  loadConversations,
} from "./strategy/conversation";
import { ChatCompletionRoleEnum, IView } from "./strategy/conversationspec";
import { COMMAND_TYPE_CLI, Command } from "./promptdef/promptcommand";
import { getWebviewHtmlv2 } from "./webviewhtml";
// import { getWebviewHtmlv2 } from "./webviewhtml";

export default class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "flexigpt.chatView";

  public _view?: vscode.WebviewView | undefined;

  // This variable holds a reference to the ChatGPTAPI instance
  private _apiProvider: Providers | null = null;
  private _commandRunnerContext?: CommandRunnerContext;
  private _conversationCollection?: ConversationCollection;
  private _response?: string;
  private _prompt?: string;
  private _fullPrompt?: string;
  private _conversationHistoryPath?: string;

  public selectedInsideCodeblock = true;
  public pasteOnClick = false;

  /**
   * Message to be rendered lazily if they haven't been rendered
   * in time before resolveWebviewView is called.
   */
  private leftOverMessage?: any;

  // In the constructor, we store the URI of the extension
  constructor(
    private readonly _extensionUri: vscode.Uri,
    private context: vscode.ExtensionContext
  ) {}

  // Set the api key and create a new API instance based on this
  public setAPIProviders(providers: Providers) {
    this._apiProvider = providers;
  }

  private _newAPI() {
    this._apiProvider = getAllProviders();
  }

  unescapeChars(text: string) {
    return text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  getProvider(model: string, providerName: string = ""): CompletionProvider {
    if (!this._apiProvider) {
      this._newAPI();
    }
    return this._apiProvider!.getProvider(model, providerName);
  }

  public importConversations() {
    // Get the base extension path
    const extensionPath = this.context.extensionUri.fsPath;

    // Define the path of the conversation history file relative to the extension path
    this._conversationHistoryPath = path.join(
      extensionPath,
      "conversations.yml"
    );
    log.info("Conversation history path: " + this._conversationHistoryPath);
    // Load conversations from the file
    let conversations = loadConversations(this._conversationHistoryPath);
    if (conversations) {
      this._conversationCollection = conversations;
    } else {
      this._conversationCollection = new ConversationCollection();
    }
    this._conversationCollection.startNewConversation();
    this.sendConversationListMessage();
  }

  public setCommandRunnerContext(commandRunnerContext: CommandRunnerContext) {
    this._commandRunnerContext = commandRunnerContext;
  }

  public importAllPromptFiles() {
    if (this._commandRunnerContext) {
      log.info("Importing files now");
      importAllPrompts(this._extensionUri, this._commandRunnerContext);
      this.sendCommandListMessage();
    }
  }

  public async runCLIOptions() {
    if (!this._commandRunnerContext) {
      return;
    }
    let items =
      this._commandRunnerContext.getAllCommandsAsLabels(COMMAND_TYPE_CLI);
    let result = await vscode.window.showQuickPick(items, {
      placeHolder: "Pick an CLI to run",
    });
    if (result) {
      log.info(`Running CLI: ${result.label}`);
      await vscode.commands.executeCommand("flexigpt.chatView.focus");
      let prompt = result.label;
      const uuid = uuidv4();
      let response = "";

      let preparedIn = this._commandRunnerContext?.prepareAndSetCommand(prompt);
      let preparedQuestion = (preparedIn?.question as string) || "";
      let command = preparedIn?.command;
      if (!command) {
        throw Error("Could not get prepared command");
      }
      response = await this.processCli(prompt, uuid, preparedQuestion, command);
      // Saves the response
      this._response = response;
    }
  }

  public getCodeUsingComment() {
    let line = getActiveLine();
    if (!line) {
      return "";
    }
    let fpath = getActiveDocumentFilePath();
    let lang = getActiveDocumentLanguageID();
    let inline =
      `Give code using the below comment.\nFilename: ${fpath}\nLang:${lang}\nComment:` +
      line.trim();
    this.getResponseUsingInput(inline).then((response) => {
      append("\n" + response, "end");
    });
  }

  async getResponseUsingInput(line: string) {
    let response: string;
    let fullResponseStr = "";
    try {
      let preparedIn = this._commandRunnerContext?.prepareAndSetCommand(
        line,
        "",
        false
      );
      let preparedQuestion = (preparedIn?.question as string) || "";
      let command = preparedIn?.command;
      if (!command) {
        throw Error("Could not get prepared command");
      }
      // Send the search prompt to the API instance
      this._fullPrompt = preparedQuestion;
      // log.info(`Request params read: ${JSON.stringify(command.requestparams, null, 2)}`);
      let model = command.requestparams?.model as string;
      let providerName = (command.requestparams?.provider as string) || "";
      let apiProvider = this.getProvider(model, providerName);
      var crequest = apiProvider?.checkAndPopulateCompletionParams(
        preparedQuestion,
        null,
        command.requestparams
      );
      if (crequest) {
        const crequestJsonStr = JSON.stringify(crequest, null, 2);
        const crequestStr = prettier.format(crequestJsonStr, {
          parser: "json",
        });
        log.info(`sending api request. Full request: ${crequestStr}`);

        let completionResponse = await apiProvider?.completion(crequest);
        // let completionResponse = {fullResponse: "full", data:"This is a unittest \n ```def myfunc(): print('hello there')```"};

        response = completionResponse?.data as string | "";
        if (response) {
          response = this.unescapeChars(response);
        } else {
          response = "Got empty response";
        }
        fullResponseStr = JSON.stringify(
          completionResponse?.fullResponse,
          null,
          2
        );
      } else {
        throw Error("Could not process request");
      }
    } catch (e) {
      log.error(e);
      response = `[ERROR] ${e}`;
      fullResponseStr = filterSensitiveInfoFromJsonString(
        JSON.stringify(e, null, 2)
      );
    }
    log.info(`Got response: ${response}\n Full response: ${fullResponseStr}`);
    return response;
  }

  private sendCommandListMessage() {
    if (!this._commandRunnerContext) {
      return;
    }
    this._view?.webview.postMessage({
      type: "setCommandList",
      data: this._commandRunnerContext.getAllCommandsAsLabels(),
    });
  }

  private sendConversationsViewMessage(views: IView[] | undefined) {
    if (!views) {
      return;
    }
    // log.info("Sending conversations view message:" + JSON.stringify(views));
    this._view?.webview.postMessage({
      type: "setConversationsView",
      data: views,
    });
  }

  private sendConversationListMessage() {
    if (
      !this._conversationCollection ||
      !this._conversationCollection.conversations
    ) {
      return;
    }
    if (
      this._conversationCollection.conversations.length === 1 &&
      this._conversationCollection.conversations[0].getMessageStream()
        .length === 0
    ) {
      return;
    }
    let convoSlice = this._conversationCollection.conversations
      .slice(-20)
      .reverse();
    let conversationList: { label: number; description: string }[] = [];
    for (const c of convoSlice) {
      if (c.getMessageStream().length > 0) {
        conversationList.push({
          label: c.id,
          description: `${c.id}: ${c
            .getMessageStream()[0]
            .content.substring(0, 32)}...`,
        });
      }
    }
    this._view?.webview.postMessage({
      type: "setConversationList",
      data: conversationList,
    });
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    // set options for the webview
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // set the HTML for the webview
    // webviewView.webview.html = getHtmlForWebviewv1(webviewView.webview, this._extensionUri);
    webviewView.webview.html = getWebviewHtmlv2(
      webviewView.webview,
      this._extensionUri
    );

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "addFreeTextQuestion":
          this.search(data.value);
          break;
        // case "ask": {
        //   this.search(data.value);
        //   break;
        // }
        case "clearConversation":
          this._conversationCollection?.saveAndStartNewConversation(
            this._conversationHistoryPath,
            true
          );
          break;
        case "saveConversation":
          this._conversationCollection?.saveCurrentConversation(
            this._conversationHistoryPath,
            true
          );
          break;
        case "exportConversation":
          const conversationYaml =
            this._conversationCollection?.currentConversation.getConversationYML();
          if (!conversationYaml) {
            break;
          }
          const convoDocument = await vscode.workspace.openTextDocument({
            content: conversationYaml,
            language: "yaml",
          });
          vscode.window.showTextDocument(convoDocument);
          break;
        case "loadConversation":
          let msg = data.value;
          // log.info(`loading conversation for ${JSON.stringify(msg)}`);
          this._conversationCollection?.setConversationAsActive(msg.label);
          this.sendConversationsViewMessage(
            this._conversationCollection?.currentConversation.views
          );
          break;
        case "prompt": {
          this.search(data.value);
          break;
        }
        case "editCode":
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(data.value)
          );
          break;
        case "openNew":
          const document = await vscode.workspace.openTextDocument({
            content: data.value,
          });
          vscode.window.showTextDocument(document);
          break;
        case "getCommandListForWebView":
          this.sendCommandListMessage();
          break;
        case "getConversationListForWebView":
          this.sendConversationListMessage();
          break;
        case "focus":
          vscode.commands.executeCommand(
            "workbench.action.focusActiveEditorGroup"
          );
          this.sendCommandListMessage();
          break;
        default:
          break;
      }
    });

    this._view = webviewView;

    // this._view?.onDidChangeVisibility((e) => {
    //   if (this._view && !this._view!.visible) {
    //     this._view = undefined;
    //   }
    // });

    if (this.leftOverMessage !== null) {
      // If there were any messages that wasn't delivered, render after resolveWebView is called.
      // this.search(this.leftOverMessage);
      this.leftOverMessage = null;
    }
    this.sendCommandListMessage();
  }

  public async viewId(): Promise<string> {
    return ChatViewProvider.viewType;
  }

  public async setFocus() {
    await vscode.commands.executeCommand("flexigpt.chatView.focus");
    // log.info("in set focus");
    await this.sendMessage({ type: "focus", value: "" });
    return;
  }

  /**
   * Message sender, stores if a message cannot be delivered
   * @param message Message to be sent to WebView
   * @param ignoreMessageIfNullWebView We will ignore the command if webView is null/not-focused
   */
  public async sendMessage(message: any, ignoreMessageIfNullWebView?: boolean) {
    // If the ChatGPT view is not in focus/visible; focus on it to render Q&A
    if (this._view === null) {
      // log.info(" in chatview focus");
      await vscode.commands.executeCommand("flexigpt.chatView.focus");
    } else if (!ignoreMessageIfNullWebView) {
      this.leftOverMessage = message;
    } else {
      // log.info(" in show view");
      this._view?.show?.(true);
    }
    // log.info(" posting message focus");
    // await this._view?.webview.postMessage(message);
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this._view?.webview?.postMessage) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });

    await this._view?.webview.postMessage(message);
  }

  async sendAPIRequest(
    inPrompt: string,
    uuid: string,
    preparedQuestion: string,
    command: Command
  ): Promise<string> {
    let response: string;
    let fullResponseStr = "";
    try {
      // Send the search prompt to the ChatGPTAPI instance and store the response
      // If successfully signed in
      this._fullPrompt = preparedQuestion;
      // log.info(`Request params read: ${JSON.stringify(command.requestparams, null, 2)}`);
      let model = command.requestparams?.model as string;
      let providerName = (command.requestparams?.provider as string) || "";
      let apiProvider = this.getProvider(model, providerName);
      var crequest = apiProvider?.checkAndPopulateCompletionParams(
        preparedQuestion,
        this._conversationCollection?.currentConversation?.getMessagesAsRequests() ||
          null,
        command.requestparams
      );
      if (crequest) {
        if (crequest.messages && crequest.messages.length >= 1) {
          this._conversationCollection?.addMessagesToCurrent([
            crequest.messages[crequest.messages.length - 1],
          ]);
        }
        const crequestJsonStr = JSON.stringify(crequest, null, 2);
        const crequestStr = prettier.format(crequestJsonStr, {
          parser: "json",
        });
        // log.info(`sending api request. Full request: ${crequestStr}`);
        await this.sendMessage({
          type: "addQuestion",
          value: inPrompt,
          id: uuid,
          fullapi: crequestStr,
        });
        this._conversationCollection?.addViewsToCurrent([
          { type: "addQuestion", value: inPrompt, id: uuid, full: crequestStr },
        ]);

        let completionResponse = await apiProvider?.completion(crequest);
        // let completionResponse = {fullResponse: "full", data:"This is a unittest \n ```def myfunc(): print('hello there')```"};

        response = completionResponse?.data as string | "";
        if (response) {
          response = this.unescapeChars(response);
        } else {
          response = "Got empty response";
        }
        fullResponseStr = JSON.stringify(
          completionResponse?.fullResponse,
          null,
          2
        );
        this._conversationCollection?.addMessagesToCurrent([
          { role: "assistant" as ChatCompletionRoleEnum, content: response },
        ]);
        this._commandRunnerContext?.processAnswer(
          command,
          response,
          getActiveDocumentLanguageID()
        );
        let processedResponse = this._commandRunnerContext?.getSystemVariable(
          systemVariableNames.sanitizedAnswer
        );
        if (processedResponse) {
          response = processedResponse;
        }
      } else {
        throw Error("Could not process request");
      }
    } catch (e) {
      log.error(e);
      response = `[ERROR] ${e}`;
      fullResponseStr = filterSensitiveInfoFromJsonString(
        JSON.stringify(e, null, 2)
      );
    }
    const cresponseStr = prettier.format(fullResponseStr, { parser: "json" });
    await this.sendMessage({
      type: "addResponse",
      value: response,
      id: uuid,
      done: true,
      fullResponse: cresponseStr,
      docLanguage: getActiveDocumentLanguageID(),
    });
    this._conversationCollection?.addViewsToCurrent([
      {
        type: "addResponse",
        value: response,
        id: uuid,
        full: cresponseStr,
        params: { done: true, docLanguage: getActiveDocumentLanguageID() },
      },
    ]);
    if (!response) {
      throw Error("Could not get response from CompletionProvider.");
    }
    return response;
  }

  async processCli(
    inPrompt: string,
    uuid: string,
    preparedQuestion: string,
    command: Command
  ): Promise<string> {
    let response = "";
    let fullResponseStr = "";
    await this.sendMessage({
      type: "addQuestion",
      value: inPrompt,
      id: uuid,
      fullapi: preparedQuestion,
    });

    try {
      let result = await runCommandInShell(preparedQuestion);
      if (result[1]) {
        response = "\n```shell\n" + result[1] + "\n```\n";
      }
      fullResponseStr = JSON.stringify(
        {
          cwd: result[0],
          command: preparedQuestion,
          response: response,
          exitCode: result[2],
        },
        null,
        2
      );
    } catch (e) {
      log.error(e);
      response = `[ERROR] ${e}`;
      fullResponseStr = filterSensitiveInfoFromJsonString(
        JSON.stringify(e, null, 2)
      );
    }
    await this.sendMessage({
      type: "addResponse",
      value: response,
      id: uuid,
      done: true,
      fullResponse: prettier.format(fullResponseStr, { parser: "json" }),
      docLanguage: "shell",
    });
    return response;
  }

  public async search(prompt: string) {
    // If the ChatGPT view is not in focus/visible; focus on it to render Q&A
    if (this._view === null) {
      await vscode.commands.executeCommand("flexigpt.chatView.focus");
    } else {
      this._view?.show?.(true);
    }

    const uuid = uuidv4();
    let response = "";

    let preparedIn = this._commandRunnerContext?.prepareAndSetCommand(prompt);
    let preparedQuestion = (preparedIn?.question as string) || "";
    let command = preparedIn?.command;
    if (!command) {
      throw Error("Could not get prepared command");
    }

    if (command.type === COMMAND_TYPE_CLI) {
      response = await this.processCli(prompt, uuid, preparedQuestion, command);
    } else {
      response = await this.sendAPIRequest(
        prompt,
        uuid,
        preparedQuestion,
        command
      );
    }
    // Saves the response
    this._response = response;
  }
}

