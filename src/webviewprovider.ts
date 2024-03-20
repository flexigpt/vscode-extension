/* eslint-disable no-unused-vars */
import * as path from 'path';
import * as vscode from 'vscode';

import { filterSensitiveInfoFromJsonString } from 'aiprovider/api';

import log from './logger/log';

import { COMMAND_TYPE_CLI, Command } from 'prompts/promptdef/promptcommand';
import { IView } from 'spec/chat';
import { WorkflowProvider } from 'workflowprovider';
import {
  append,
  getActiveDocumentFilePath,
  getActiveDocumentLanguageID,
  getActiveLine,
  runCommandInShell
} from './vscodeutils/vscodefunctions';
import { getWebviewHtml } from './webviewhtml';
import { unescapeChars } from 'aiprovider';

export default class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'flexigpt.chatView';
  public _view?: vscode.WebviewView | undefined;
  public workflowProvider: WorkflowProvider;

  // In the constructor, we store the URI of the extension
  constructor(
    private readonly _extensionUri: vscode.Uri,
    private context: vscode.ExtensionContext,
    workflowProvider: WorkflowProvider
  ) {
    this.workflowProvider = workflowProvider;
  }

  // Set the api key and create a new API instance based on this
  public setWorkflowProvider(provider: WorkflowProvider) {
    this.workflowProvider = provider;
  }

  public importConversations() {
    // Get the base extension path
    const extensionPath = this.context.extensionUri.fsPath;

    // Define the path of the conversation history file relative to the extension path
    const conversationHistoryPath = path.join(
      extensionPath,
      'conversations.yml'
    );
    if (!conversationHistoryPath) {
      log.info('Could not geta conversation history path');
      return;
    }
    this.workflowProvider.importConversations(conversationHistoryPath, true);
    this.sendConversationListMessage();
  }

  public importAllPromptFiles() {
    const config = vscode.workspace.getConfiguration('flexigpt');
    const promptFiles = config.get('promptFiles') as string | '';
    const inBuiltPrompts = config.get('inBuiltPrompts') as string | '';

    let inBuiltPromptNames = 'flexigptbasic.js';
    if (inBuiltPrompts) {
      inBuiltPromptNames = inBuiltPromptNames + ';' + inBuiltPrompts;
    }
    const basePath = vscode.Uri.joinPath(
      this._extensionUri,
      'media',
      'prompts'
    ).fsPath;

    const parray = inBuiltPromptNames.split(';');
    const fullPromptsArray = parray.map(f => `${basePath}/${f}`);
    if (promptFiles) {
      const newPromptFiles = promptFiles.split(';');
      fullPromptsArray.push(...newPromptFiles);
    }

    if (fullPromptsArray) {
      this.workflowProvider.importAllPromptFiles(fullPromptsArray);
    }
    this.sendCommandListMessage();
  }

  public async runCLIOptions() {
    if (!this.workflowProvider) {
      return;
    }
    const items =
      this.workflowProvider.commandRunnerContext.getAllCommandsAsLabels(
        COMMAND_TYPE_CLI
      );
    const result = await vscode.window.showQuickPick(items, {
      placeHolder: 'Pick an CLI to run'
    });
    if (!result) {
      return {};
    }
    log.info(`Running CLI: ${result.label}`);
    await vscode.commands.executeCommand('flexigpt.chatView.focus');
    const resp = await this.search(result.label);
    return resp;
  }

  public async viewId(): Promise<string> {
    return ChatViewProvider.viewType;
  }

  public async setFocus() {
    await vscode.commands.executeCommand('flexigpt.chatView.focus');
    // log.info("in set focus");
    await this.sendMessage({ type: 'focus', value: '' });
    return;
  }

  private sendCommandListMessage() {
    if (!this.workflowProvider.commandRunnerContext) {
      return;
    }
    this._view?.webview.postMessage({
      type: 'setCommandList',
      data: this.workflowProvider.commandRunnerContext.getAllCommandsAsLabels()
    });
  }

  private sendConversationsViewMessage(views: IView[] | undefined) {
    if (!views) {
      return;
    }
    // log.info("Sending conversations view message:" + JSON.stringify(views));
    this._view?.webview.postMessage({
      type: 'setConversationsView',
      data: views
    });
  }

  private sendConversationListMessage() {
    const conversationList =
      this.workflowProvider.conversationCollection.getConversationListSummary();
    if (!conversationList) {
      return;
    }
    this._view?.webview.postMessage({
      type: 'setConversationList',
      data: conversationList
    });
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
      await vscode.commands.executeCommand('flexigpt.chatView.focus');
    } else {
      // log.info(" in show view");
      this._view?.show?.(true);
    }
    // log.info(" posting message focus");
    // await this._view?.webview.postMessage(message);
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (this._view?.webview?.postMessage) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });

    await this._view?.webview.postMessage(message);
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
      localResourceRoots: [this._extensionUri]
    };

    // set the HTML for the webview
    // webviewView.webview.html = getWebviewHtmlReact(
    //   webviewView.webview,
    //   this._extensionUri
    // );

    webviewView.webview.html = getWebviewHtml(
      webviewView.webview,
      this._extensionUri
    );

    webviewView.webview.onDidReceiveMessage(async data => {
      switch (data.type) {
        case 'addFreeTextQuestion':
          // If the ChatGPT view is not in focus/visible; focus on it to render Q&A
          if (this._view === null) {
            await vscode.commands.executeCommand('flexigpt.chatView.focus');
          } else {
            this._view?.show?.(true);
          }
          this.search(data.value);
          break;
        // case "ask": {
        //   this.search(data.value);
        //   break;
        // }
        case 'clearConversation':
          this.workflowProvider.clearConversation();
          break;
        case 'saveConversation':
          this.workflowProvider.saveConversation();
          break;
        case 'exportConversation': {
          const conversationYaml =
            this.workflowProvider.conversationCollection.currentConversation.getConversationYML();
          if (!conversationYaml) {
            break;
          }
          const convoDocument = await vscode.workspace.openTextDocument({
            content: conversationYaml,
            language: 'yaml'
          });
          vscode.window.showTextDocument(convoDocument);
          break;
        }
        case 'loadConversation': {
          const msg = data.value;
          // log.info(`loading conversation for ${JSON.stringify(msg)}`);
          this.workflowProvider.conversationCollection.setConversationAsActive(
            msg.label
          );
          this.sendConversationsViewMessage(
            this.workflowProvider.conversationCollection.currentConversation
              .views
          );
          break;
        }
        case 'prompt': {
          // If the ChatGPT view is not in focus/visible; focus on it to render Q&A
          if (this._view === null) {
            await vscode.commands.executeCommand('flexigpt.chatView.focus');
          } else {
            this._view?.show?.(true);
          }
          this.search(data.value);
          break;
        }
        case 'editCode':
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(data.value)
          );
          break;
        case 'openNew': {
          const document = await vscode.workspace.openTextDocument({
            content: data.value
          });
          vscode.window.showTextDocument(document);
          break;
        }
        case 'getCommandListForWebView':
          this.sendCommandListMessage();
          break;
        case 'getConversationListForWebView':
          this.sendConversationListMessage();
          break;
        case 'focus':
          vscode.commands.executeCommand(
            'workbench.action.focusActiveEditorGroup'
          );
          this.sendCommandListMessage();
          break;
        default:
          break;
      }
    });

    this._view = webviewView;
    this.sendCommandListMessage();
  }

  async sendAPIRequest(
    reqUUID: string,
    inPrompt: string,
    preparedQuestion: string,
    command: Command
  ) {
    let fullReqStr = '';
    let response = '';
    let fullResponseStr = '';
    const docLanguage = getActiveDocumentLanguageID();
    try {
      const { apiProvider, crequest, crequestStr } =
        await this.workflowProvider.createCompletionRequest(
          reqUUID,
          inPrompt,
          preparedQuestion,
          command,
          true
        );
      fullReqStr = crequestStr;

      // log.info(`sending api request. Full request: ${crequestStr}`);
      await this.sendMessage({
        type: 'addQuestion',
        value: inPrompt,
        id: reqUUID,
        fullapi: fullReqStr
      });

      const resp = await this.workflowProvider.getCompletionResponse(
        reqUUID,
        apiProvider,
        crequest,
        true,
        docLanguage
      );
      response = resp.response;
      fullResponseStr = resp.fullResponseStr;

      response = this.workflowProvider.postProcessResp(
        command,
        response,
        docLanguage
      );
    } catch (e) {
      log.error(e);
      response = `[ERROR] ${e}`;
      fullResponseStr = filterSensitiveInfoFromJsonString(
        JSON.stringify(e, null, 2)
      );
    }

    await this.sendMessage({
      type: 'addResponse',
      value: response,
      id: reqUUID,
      done: true,
      fullResponse: fullResponseStr,
      docLanguage: getActiveDocumentLanguageID()
    });

    if (!response) {
      throw Error('Could not get response from CompletionProvider.');
    }
    return { response, fullResponseStr };
  }

  async processCli(
    inPrompt: string,
    uuid: string,
    preparedQuestion: string,
    command: Command
  ) {
    let response = '';
    let fullResponseStr = '';
    await this.sendMessage({
      type: 'addQuestion',
      value: inPrompt,
      id: uuid,
      fullapi: preparedQuestion
    });

    try {
      const result = await runCommandInShell(preparedQuestion);
      if (result[1]) {
        response = '\n```shell\n' + result[1] + '\n```\n';
      }
      fullResponseStr = JSON.stringify(
        {
          cwd: result[0],
          command: preparedQuestion,
          response: response,
          exitCode: result[2]
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
      fullResponseStr = JSON.stringify(fullResponseStr, null, 2);
    }
    await this.sendMessage({
      type: 'addResponse',
      value: response,
      id: uuid,
      done: true,
      fullResponse: fullResponseStr,
      docLanguage: 'shell'
    });
    return { response, fullResponseStr };
  }

  public async search(prompt: string) {
    let reqUUID = '';
    let response = '';
    let fullResponseStr = '';
    try {
      const { question, command, reqID } =
        this.workflowProvider.prepareCommand(prompt);
      reqUUID = reqID;

      if (command.type === COMMAND_TYPE_CLI) {
        const resp = await this.processCli(prompt, reqID, question, command);
        response = resp.response;
        fullResponseStr = resp.fullResponseStr;
      } else {
        const resp = await this.sendAPIRequest(
          reqID,
          prompt,
          question,
          command
        );
        response = resp.response;
        fullResponseStr = resp.fullResponseStr;
      }
    } catch (e) {
      log.error(e);
      response = `[ERROR] ${e}`;
      fullResponseStr = filterSensitiveInfoFromJsonString(
        JSON.stringify(e, null, 2)
      );
    }
    // log.info(`Got response: ${response}\n Full response: ${fullResponseStr}`);
    return { reqUUID, prompt, response, fullResponseStr };
  }

  public async getCodeUsingComment() {
    try {
      const line = getActiveLine();
      if (!line) {
        log.info('Couldnt get the comment to process');
        return '';
      }
      const fpath = getActiveDocumentFilePath();
      const lang = getActiveDocumentLanguageID();
      const inlineMsg = 'Give code using the below comment:';
      const inlineCode =
        'Language:' +
        lang +
        '\n' +
        'Filename:' +
        fpath +
        '\n' +
        'Comment:' +
        '\n' +
        line.trim();
      const response = await this.workflowProvider.getResponseUsingInput(
        inlineMsg + '\n' + inlineCode
      );
      this.setFocus();
      await this.sendMessage({
        type: 'addQuestion',
        value: inlineMsg,
        code: inlineCode,
        id: response.reqUUID,
        fullapi: response.fullReqStr
      });

      append('\n' + response.response, 'end');
      const displayResp = unescapeChars(
        '\n```' + lang + '\n' + response.response + '\n```\n'
      );

      await this.sendMessage({
        type: 'addResponse',
        value: displayResp,
        id: response.reqUUID,
        done: true,
        fullResponse: response.fullResponseStr,
        docLanguage: lang
      });
    } catch (error) {
      log.error(error);
    }
  }
}
