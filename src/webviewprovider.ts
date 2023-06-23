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
import { getActiveDocumentLanguageID } from "./vscodeutils/vscodefunctions";
import {
  ConversationCollection,
  loadConversations,
} from "./strategy/conversation";
import { ChatCompletionRoleEnum, IView } from "./strategy/conversationspec";
import { Command } from "./promptdef/promptcommand";

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
  };

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
    await this._view?.webview.postMessage(message);
  }

  async sendAPIRequest(
    inPrompt: string,
    uuid: string,
    suffix?: string
  ): Promise<string> {
    let response: string;
    let fullResponseStr = "";
    try {
      let preparedIn = this._commandRunnerContext?.prepareAndSetCommand(
        inPrompt,
        suffix
      );
      let question = (preparedIn?.question as string) || "";
      let command = preparedIn?.command;
      if (!command) {
        throw Error("Could not get prepared command");
      }
      // Send the search prompt to the ChatGPTAPI instance and store the response
      // If successfully signed in
      this._fullPrompt = question;
      // log.info(`Request params read: ${JSON.stringify(command.requestparams, null, 2)}`);
      let model = command.requestparams?.model as string;
      let providerName = (command.requestparams?.provider as string) || "";
      let apiProvider = this.getProvider(model, providerName);
      var crequest = apiProvider?.checkAndPopulateCompletionParams(
        question,
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
        let processedResponse =
          this._commandRunnerContext?.getSystemVariable(
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

  public async search(prompt: string) {
    // If the ChatGPT view is not in focus/visible; focus on it to render Q&A
    if (this._view === null) {
      await vscode.commands.executeCommand("flexigpt.chatView.focus");
    } else {
      this._view?.show?.(true);
    }

    const uuid = uuidv4();
    let response = "";

    response = await this.sendAPIRequest(prompt, uuid);
    // Saves the response
    this._response = response;
  }
}

function getWebviewHtmlv2(webview: vscode.Webview, extensionUri: vscode.Uri) {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "main.js")
  );
  const stylesMainUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "main.css")
  );

  const vendorHighlightCss = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "highlight.min.css")
  );
  const vendorAutocompleteCss = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "autocomplete.css")
  );
  // const vendorAutocompleteJs = webview.asWebviewUri(
  //   vscode.Uri.joinPath(extensionUri, "media", "scripts", "autocomplete.js")
  // );
  // <script src="${vendorAutocompleteJs}"></script>
  const vendorHighlightJs = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "highlight.min.js")
  );
  const vendorMarkedJs = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "marked.min.js")
  );
  const vendorTailwindJs = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "media",
      "scripts",
      "tailwindcss.3.2.4.min.js"
    )
  );
  const vendorTurndownJs = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "turndown.js")
  );

  return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesMainUri}" rel="stylesheet">
				<link href="${vendorHighlightCss}" rel="stylesheet">
        <link href="${vendorAutocompleteCss}" rel="stylesheet">
				<script src="${vendorHighlightJs}"></script>
				<script src="${vendorMarkedJs}"></script>
				<script src="${vendorTailwindJs}"></script>
				<script src="${vendorTurndownJs}"></script>
			</head>
			<body class="overflow-hidden">
				<div class="flex flex-col h-screen">
          <select id="conversation-select" class="flex gap-3 p-2 flex-wrap items-center justify-end w-full shadow-sm sm:text-sm input-background rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="w-4 h-4">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path stroke="currentColor" stroke-width="1.5"  fill="none" d="M6.455 19L2 22.5V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.455zM13 11h3l-4-4-4 4h3v4h2v-4z"/>
            </svg>
            <option value="">Load a conversation...</option>
          </select>
					<div id="introduction" class="flex h-full items-center justify-center px-6 w-full relative">
						<div class="flex items-start text-center gap-3.5">
							<div class="flex flex-col gap-3.5 flex-1">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="w-6 h-6 m-auto">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"></path>
								</svg>
								<h2 class="text-lg font-normal">Features</h2>
								<ul class="flex flex-col gap-3.5">
								  <li class="w-full bg-gray-50 dark:bg-white/5 p-2 rounded-md text-gray-600">Become a power user of GPT models</li>	
									<li class="w-full bg-gray-50 dark:bg-white/5 p-2 rounded-md text-gray-600">Improve your code, add tests & find bugs</li>
									<li class="w-full bg-gray-50 dark:bg-white/5 p-2 rounded-md text-gray-600">Syntax highlighting with auto language detection</li>
                  <li class="w-full bg-gray-50 dark:bg-white/5 p-2 rounded-md text-gray-600">Optimized for dialogue</li>
								</ul>
							</div>
							<div class="flex flex-col gap-3.5 flex-1">
								<svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 m-auto" height="1em" width="1em"
									xmlns="http://www.w3.org/2000/svg">
									<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
									<line x1="12" y1="9" x2="12" y2="13"></line>
									<line x1="12" y1="17" x2="12.01" y2="17"></line>
								</svg>
								<h2 class="text-lg font-normal">Limitations</h2>
								<ul class="flex flex-col gap-3.5">
									<li class="w-full bg-gray-50 dark:bg-white/5 p-2 rounded-md text-gray-600">May occasionally take long time to respond/fail</li>
									<li class="w-full bg-gray-50 dark:bg-white/5 p-2 rounded-md text-gray-600">May throw HTTP 429, if you make too many requests; or a partial response if you exceed max_tokens</li>
								</ul>
							</div>
						</div>
					</div>

          <div class="flex-1 overflow-y-auto" id="qa-list"></div>

					<div id="in-progress" class="pl-4 pt-2 flex items-center hidden">
						<div class="typing">Typing</div>
						<div class="spinner">
							<div class="bounce1"></div>
							<div class="bounce2"></div>
							<div class="bounce3"></div>
						</div>
					</div>

					<div id="chat-button-wrapper" class="w-full flex gap-4 justify-center items-center mt-2 hidden">
            <button class="flex gap-2 justify-center items-center rounded-lg p-2 bg-gray-100 text-gray-700 hover:bg-gray-200" id="save-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 19V5C3 3.89543 3.89543 3 5 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L20.4142 6.41421C20.7893 6.78929 21 7.29799 21 7.82843V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M8.6 9H15.4C15.7314 9 16 8.73137 16 8.4V3.6C16 3.26863 15.7314 3 15.4 3H8.6C8.26863 3 8 3.26863 8 3.6V8.4C8 8.73137 8.26863 9 8.6 9Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M18 13.6V21H6V13.6C6 13.2686 6.26863 13 6.6 13H17.4C17.7314 13 18 13.2686 18 13.6Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>          
              Save
            </button>
						<button class="flex gap-2 justify-center items-center rounded-lg p-2" id="clear-button">
							<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
							Clear
						</button>
						<button class="flex gap-2 justify-center items-center rounded-lg p-2" id="export-button">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
								<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
							</svg>
							Export
						</button>
					</div>

					<div class="p-2 flex items-center pt-2">
						<div class="flex-1 textarea-wrapper">
						<textarea
              type="text"
              rows="1"
              id="question-input"
              placeholder="Ask a question..."
              onInput="this.parentNode.dataset.replicatedValue = this.value"></textarea>
						</div>
            <div class="autocomplete">
              <div id="commandAutocompleteList" class="autocomplete-items"></div>
            </div>
						<button title="Submit prompt" class="right-8 absolute ask-button rounded-lg p-0.5 ml-5" id="ask-button">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
						</button>
					</div>
				</div>
				<script src="${scriptUri}"></script>
        <script>
          hljs.highlightAll();
        </script>
			</body>
			</html>`;
}
