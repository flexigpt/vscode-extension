import * as vscode from 'vscode';

import * as path from 'node:path';
import * as https from 'node:https';
import { Transform } from 'node:stream';

import { GENERATOR_LINE_MATCH, MESSAGES } from './consts';
import { getGeneratorLines } from './regexmatcher';
import Provider from './strategy';
import Codex from './openaiapi';
import log from "./log";


const getOpenAIProvider = async (): Promise<Provider> => {
	const config = vscode.workspace.getConfiguration('flexigpt');
	const apiKey = config.get('openai.apiKey') as string || "";
	const timeout = config.get('timeout') as BigInt || 60;

	if (apiKey) {
	  return new Provider(new Codex(apiKey, timeout));
	}
  
	throw new Error('You must set an `apiKey` for OpenAI APIs');
  };

export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration('flexigpt');
	const promptConfigFiles = config.get('promptConfigFiles') as string | "";

	// Create a new OpenAIAPIProvider instance and register it with the extension's context
	const apiProvider = getOpenAIProvider();
	
	const provider = new GPTViewProvider(context.extensionUri);
	provider.setAPIProvider(apiProvider);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(GPTViewProvider.viewType, provider,  {
			webviewOptions: { retainContextWhenHidden: true }
		})
	);


	// Register the commands that can be called from the extension's package.json
	const commandHandler = (command:string) => {
		const config = vscode.workspace.getConfiguration('flexigpt');
		const prompt = config.get(command) as string;
		provider.search(prompt);
	};

	const commandAsk = vscode.commands.registerCommand('flexigpt.ask', () => {
		vscode.window.showInputBox({ prompt: 'What do you want to ask?' }).then((value) => {
			provider.search(value);
		});
	});

	const commandDoc = vscode.commands.registerCommand('flexigpt.doc', () => {	
		commandHandler('promptPrefix.doc');
	});

	const commandRefactor = vscode.commands.registerCommand('flexigpt.refactor', () => {
		commandHandler('promptPrefix.refactor');
	});

	const commandOptimize = vscode.commands.registerCommand('flexigpt.optimize', () => {
		commandHandler('promptPrefix.optimize');
	});

	const commandProblems = vscode.commands.registerCommand('flexigpt.findProblems', () => {
		commandHandler('promptPrefix.findProblems');
	});

	context.subscriptions.push(commandAsk, commandDoc, commandRefactor, commandOptimize, commandProblems);


	// Change the extension's openai token when configuration is changed
	vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
		if (event.affectsConfiguration('flexigpt.openai.apiKey')) {
			// add the new token to the provider
			const apiProvider = getOpenAIProvider();
			provider.setAPIProvider(apiProvider);

		} else if (event.affectsConfiguration('flexigpt.openai.timeout')) {
			// add the new token to the provider
			const apiProvider = getOpenAIProvider();
			provider.setAPIProvider(apiProvider);
			
		} else if (event.affectsConfiguration('flexigpt.promptConfigFiles')) {
			const config = vscode.workspace.getConfiguration('flexigpt');
			const promptConfigFiles = config.get('promptConfigFiles') as string | "";
		} 
});
}

class GPTViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'flexigpt.chatView';

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
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		// set options for the webview
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		// set the HTML for the webview
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// add an event listener for messages received by the webview
		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'codeSelected':
					{
						// do nothing if the pasteOnClick option is disabled
						if (!this.pasteOnClick) {
							break;
						}

						let code = data.value;
						code = code.replace(/([^\\])(\$)([^{0-9])/g, "$1\\$$$3");

						// insert the code as a snippet into the active text editor
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(code));
						break;
					}
				case 'prompt':
					{
						this.search(data.value);
					}
			}
		});
	}

	public async search(prompt?:string) {
		this._prompt = prompt;
		if (!prompt) {
			prompt = '';
		};

		// Check if the apiProvider instance is defined
		if (!this._apiProvider) {
			this._newAPI();
		}

		// focus gpt activity from activity bar
		if (!this._view) {
			await vscode.commands.executeCommand('flexigpt.chatView.focus');
		} else {
			this._view?.show?.(true);
		}
		
		let response = '';

		// Get the selected text of the active editor
		const selection = vscode.window.activeTextEditor?.selection;
		const selectedText = vscode.window.activeTextEditor?.document.getText(selection);
		let searchPrompt = '';

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
			response = '[ERROR] Please enter an API key in the extension settings';
		} else {
			// If successfully signed in
			log.info("sent api request");		
			// Make sure the prompt is shown
			this._view?.webview.postMessage({ type: 'setPrompt', value: this._prompt });

			if (this._view) {
				this._view.webview.postMessage({ type: 'addResponse', value: '...' });
			}

			try {
				// Send the search prompt to the ChatGPTAPI instance and store the response
				response = await (await this._apiProvider).generate(searchPrompt) as string | "";
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
			this._view.webview.postMessage({ type: 'addResponse', value: response });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {

		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const microlightUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'microlight.min.js'));
		const tailwindUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'showdown.min.js'));
		const showdownUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'tailwind.min.js'));

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

// This method is called when your extension is deactivated
export function deactivate() {}