import * as vscode from "vscode";

import Provider from "./strategy/strategy";
import log from "./logger/log";

import { getOpenAIProvider, importAllPrompts } from "./setup";
import { getDefaultCompletionCommand } from "./strategy/openaiapi";
import { Command, CommandRunnerContext } from "./promptimporter/promptcommands";

// import { ChatGPTAPI, ChatGPTConversation } from 'chatgpt';

export default class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "flexigpt.chatView";

  public _view?: vscode.WebviewView | undefined;

  // This variable holds a reference to the ChatGPTAPI instance
  private _apiProvider?: Promise<Provider>;
  private _commandList?: Command[];
  private _commandRunnerContext?: CommandRunnerContext;

  private _response?: string;
  private _prompt?: string;
  private _fullPrompt?: string;

  public selectedInsideCodeblock = true;
  public pasteOnClick = false;

  // private chatGptApi?: ChatGPTAPI;
  // private chatGptConversation?: ChatGPTConversation;
  // private sessionToken?: string;
  // public subscribeToResponse: boolean;

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
  public setAPIProvider(provider?: Promise<Provider>) {
    this._apiProvider = provider;
  }

  public setCommandList(commandList: Command[]) {
    this._commandList = commandList;
  }

  public setCommandRunnerContext(commandRunnerContext: CommandRunnerContext) {
    this._commandRunnerContext = commandRunnerContext;
  }

  public importAllFiles() {
    if (this._commandRunnerContext) {
      log.info("Importing files now");
      importAllPrompts(this._extensionUri, this._commandRunnerContext);
      this._commandList = this._commandRunnerContext.getCommands();
    }
  }
  // This private method initializes a new apiProvider instance
  private _newAPI() {
    this._apiProvider = getOpenAIProvider();
  }

  private sendCommandListMessage() {
    let commandList = this._commandList?.map((c) => ({
      label: c.name,
      description: c.description,
    }));
    this._view?.webview.postMessage({
      type: "setArray",
      data: commandList,
    });
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

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
        // case 'clearConversation':
        // 	this.prepareConversation(true);
        // 	break;
        case "prompt": {
          this.search(data.value);
          break;
        }
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

    this._view?.onDidChangeVisibility((e) => {
      if (this._view && !this._view!.visible) {
        this._view = undefined;
      }
    });

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

  /**
   * Message sender, stores if a message cannot be delivered
   * @param message Message to be sent to WebView
   * @param ignoreMessageIfNullWebView We will ignore the command if webView is null/not-focused
   */
  public async sendMessage(message: any, ignoreMessageIfNullWebView?: boolean) {
    // If the ChatGPT view is not in focus/visible; focus on it to render Q&A
    if (this._view === null) {
      await vscode.commands.executeCommand("flexigpt.chatView.focus");
    } else if (!ignoreMessageIfNullWebView) {
      this.leftOverMessage = message;
    } else {
      this._view?.show?.(true);
    }

    await this._view?.webview.postMessage(message);
  }

  public async search(prompt: string) {
    // await this.prepareConversation();

    // Check if the apiProvider instance is defined
    if (!this._apiProvider) {
      this._newAPI();
    }

    // If the ChatGPT view is not in focus/visible; focus on it to render Q&A
    if (this._view === null) {
      await vscode.commands.executeCommand("flexigpt.chatView.focus");
    } else {
      this._view?.show?.(true);
    }

    let response = "";
    // Get the selected text of the active editor
    const selection = vscode.window.activeTextEditor?.selection;
    const selectedText =
      vscode.window.activeTextEditor?.document.getText(selection);
    let searchPrompt = prompt;
    let code = "";
    if (selection && selectedText) {
      // If there is a selection, add the prompt and the selected text to the search prompt
      if (this.selectedInsideCodeblock) {
        // searchPrompt = `${prompt}\n\`\`\`\n${selectedText}\n\`\`\``;
        this._fullPrompt = `${prompt}\n\`\`\`\n${selectedText}\n\`\`\``;
        searchPrompt = prompt;
        code = `${selectedText}`;
      } else {
        searchPrompt = `${prompt}\n${selectedText}\n`;
        this._fullPrompt = searchPrompt;
      }
    } else {
      // Otherwise, just use the prompt if user typed it
      searchPrompt = prompt;
      this._fullPrompt = searchPrompt;
    }

    log.info(`sending api request. prompt: ${this._fullPrompt}`);
    if (this._apiProvider) {
      // If successfully signed in
      log.info(`sent api request. prompt: ${this._fullPrompt}`);
      await this.sendMessage({
        type: "addQuestion",
        value: searchPrompt,
        code,
      });
      // this.sendMessage({ type: "addResponse", value: "asking flexigpt ..." });
      try {
        // Send the search prompt to the ChatGPTAPI instance and store the response
        var crequest = getDefaultCompletionCommand(this._fullPrompt);
        response = (await (await this._apiProvider).completion(crequest)) as
          | string
          | "";
      } catch (e) {
        log.error(e);
        response = `[ERROR] ${e}`;
      }
    } else {
      response = "[ERROR] Please enter an API key in the extension settings";
    }
    // Saves the response
    this._response = response;
    log.info(`Got response: ${response}`);

    await this.sendMessage({ type: "addResponse", value: response });
  }
}

function getHtmlForWebviewv1(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
) {
  // return provideTextDocumentContent(this._extensionUri);
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "main.js")
  );
  const microlightUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "microlight.min.js")
  );
  const tailwindUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "showdown.min.js")
  );
  const showdownUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "tailwind.min.js")
  );

  return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="${tailwindUri}"></script>
                <script src="${showdownUri}"></script>
                <script src="${microlightUri}"></script>
                <style>
                .code {
                    white-space : pre;
                </style>
            </head>
            <body>
                <input class="h-10 w-full text-white bg-stone-700 p-4 text-sm" type="text" id="prompt-input" />

                <div id="response" class="pt-6 text-sm">
                </div>

                <script src="${scriptUri}"></script>
            </body>
            </html>`;
}

function provideTextDocumentContent(uri: vscode.Uri): string {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Autocomplete Webview</title>
          <style>
              .code-block {
                  background-color: #f2f2f2;
                  border-radius: 5px;
                  padding: 10px;
                  margin-top: 10px;
              }
              .copy-button {
                  position: absolute;
                  top: 10px;
                  right: 10px;
                  background-color: lightblue;
                  color: white;
                  padding: 5px 10px;
                  border-radius: 5px;
                  cursor: pointer;
              }
          </style>
      </head>
      <body>
          <h1>Autocomplete Input</h1>
          <input id="input" type="text" placeholder="Enter text...">
          <div class="code-block">
              <button class="copy-button">Copy</button>
              <pre id="output"></pre>
          </div>
          <script>
              const input = document.querySelector('#input');
              const output = document.querySelector('#output');
              const copyButton = document.querySelector('.copy-button');
              const dynamicText = [
                  "Option 1",
                  "Option 2",
                  "Option 3",
                  "Option 4",
                  "Option 5",
              ];
              input.addEventListener('input', (event) => {
                  const value = event.target.value;
                  const filteredOptions = dynamicText.filter((text) => text.includes(value));
                  let text;
                  if (filteredOptions.length > 0) {
                      text = filteredOptions[0];
                  } else {
                      text = dynamicText[Math.floor(Math.random() * dynamicText.length)];
                  }
                  output.innerHTML = text;
              });
              copyButton.addEventListener('click', () => {
                  navigator.clipboard.writeText(output.innerHTML);
              });
          </script>
      </body>
      </html>
  `;
}

// private async prepareConversation(reset?: boolean): Promise<boolean> {
// 	this.sessionToken = await this.context.globalState.get("chatgpt-session-token") as string;

// 	if (this.sessionToken == null) {
// 		await vscode.window
// 			.showInputBox({
// 				title: "OpenAPI ChatpGPT session token",
// 				prompt: "Please enter your OpenAPI session token (__Secure-next-auth.session-token). See Readme for more details on how to get the session token",
// 				ignoreFocusOut: true,
// 				placeHolder: "Enter the JWT Token starting with ey***"
// 			})
// 			.then((value) => {
// 				reset = true;
// 				this.sessionToken = value!;
// 				this.context.globalState.update("chatgpt-session-token", this.sessionToken);
// 			});
// 	}

// 	if (reset || this.chatGptApi == null || this.chatGptConversation == null) {
// 		try {
// 			this.chatGptApi = new ChatGPTAPI({ sessionToken: this.sessionToken });
// 			this.chatGptConversation = this.chatGptApi.getConversation();
// 		} catch (error: any) {
// 			vscode.window.showErrorMessage("Failed to instantiate the ChatGPT API. Try ChatGPT: Clear session", error?.message);
// 			this.sendMessage({ type: 'addError' });
// 			return false;
// 		}
// 	}

// 	return true;
// }

function getWebviewHtmlv2(webview: vscode.Webview, extensionUri: vscode.Uri) {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "main.js")
  );
  const stylesMainUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "main.css")
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
					<div id="introduction" class="flex h-full items-center justify-center px-6 w-full relative">
						<div class="flex items-start text-center gap-3.5">
							<div class="flex flex-col gap-3.5 flex-1">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="w-6 h-6 m-auto">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"></path>
								</svg>
								<h2 class="text-lg font-normal">Features</h2>
								<ul class="flex flex-col gap-3.5">
								  <li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">Become a power user of GPT models</li>	
									<li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">Improve your code, add tests & find bugs</li>
									<li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">Syntax highlighting with auto language detection</li>
                  <li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">Optimized for dialogue</li>
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
									<li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">May occasionally take long time to respond/fail</li>
									<li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">May throw HTTP 429, if you make too many requests</li>
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
						<button class="flex gap-2 justify-center items-center rounded-lg p-2" id="clear-button">
							<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
							Clear conversation
						</button>
						<button class="flex gap-2 justify-center items-center rounded-lg p-2" id="export-button">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
								<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
							</svg>
							Export all
						</button>
					</div>

					<div class="p-4 flex items-center pt-2">
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
			</body>
			</html>`;
}
