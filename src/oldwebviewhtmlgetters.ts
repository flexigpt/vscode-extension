import * as vscode from "vscode";

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
