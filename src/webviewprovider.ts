import * as vscode from "vscode";

import Provider from "./strategy/strategy";
import log from "./logger/log";

import { getOpenAIProvider } from "./setup";
import { getDefaultCompletionCommand } from "./strategy/openaiapi";

export default class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "flexigpt.chatView";

  private _view?: vscode.WebviewView;

  // This variable holds a reference to the ChatGPTAPI instance
  private _apiProvider?: Promise<Provider>;

  private _response?: string;
  private _prompt?: string;
  private _fullPrompt?: string;

  public selectedInsideCodeblock = false;
  public pasteOnClick = false;

  // In the constructor, we store the URI of the extension
  constructor(private readonly _extensionUri: vscode.Uri) {}

  // Set the api key and create a new API instance based on this
  public setAPIProvider(provider?: Promise<Provider>) {
    this._apiProvider = provider;
  }

  // This private method initializes a new apiProvider instance
  private _newAPI() {
    this._apiProvider = getOpenAIProvider();
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
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // add an event listener for messages received by the webview
    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "codeSelected": {
          // do nothing if the pasteOnClick option is disabled
          if (!this.pasteOnClick) {
            break;
          }

          let code = data.value;
          code = code.replace(/([^\\])(\$)([^{0-9])/g, "$1\\$$$3");

          // insert the code as a snippet into the active text editor
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(code)
          );
          break;
        }
        case "prompt": {
          this.search(data.value);
        }
      }
    });
  }

  public async search(prompt?: string) {
    this._prompt = prompt;
    if (!prompt) {
      prompt = "";
    }

    // Check if the apiProvider instance is defined
    if (!this._apiProvider) {
      this._newAPI();
    }

    // focus gpt activity from activity bar
    if (!this._view) {
      await vscode.commands.executeCommand("flexigpt.chatView.focus");
    } else {
      this._view?.show?.(true);
    }

    let response = "";

    // Get the selected text of the active editor
    const selection = vscode.window.activeTextEditor?.selection;
    const selectedText =
      vscode.window.activeTextEditor?.document.getText(selection);
    let searchPrompt = "";

    if (selection && selectedText) {
      // If there is a selection, add the prompt and the selected text to the search prompt
      if (this.selectedInsideCodeblock) {
        searchPrompt = `${prompt}\n\`\`\`\n${selectedText}\n\`\`\``;
      } else {
        searchPrompt = `${prompt}\n${selectedText}\n`;
      }
    } else {
      // Otherwise, just use the prompt if user typed it
      searchPrompt = prompt;
    }

    this._fullPrompt = searchPrompt;

    if (!this._apiProvider) {
      response = "[ERROR] Please enter an API key in the extension settings";
    } else {
      // If successfully signed in
      log.info("sent api request");
      // Make sure the prompt is shown
      this._view?.webview.postMessage({
        type: "setPrompt",
        value: this._prompt,
      });

      if (this._view) {
        this._view.webview.postMessage({ type: "addResponse", value: "..." });
      }

      try {
        // Send the search prompt to the ChatGPTAPI instance and store the response
        var crequest = getDefaultCompletionCommand(searchPrompt);
        response = (await (await this._apiProvider).completion(crequest)) as
          | string
          | "";
      } catch (e) {
        log.error(e);
        response = `[ERROR] ${e}`;
      }
    }

    // Saves the response
    this._response = response;

    // Show the view and send a message to the webview with the response
    if (this._view) {
      this._view.show?.(true);
      this._view.webview.postMessage({ type: "addResponse", value: response });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );
    const microlightUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "scripts",
        "microlight.min.js"
      )
    );
    const tailwindUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "scripts",
        "showdown.min.js"
      )
    );
    const showdownUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "scripts",
        "tailwind.min.js"
      )
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
}
