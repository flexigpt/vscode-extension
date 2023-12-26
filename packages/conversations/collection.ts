import * as fs from 'fs';

import {
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
  IMessage,
  IView
} from 'spec/chat';

import { log } from 'logger/log';
import { Conversation } from './conversation';

export class ConversationCollection {
  private _currentConversation: Conversation;
  private _conversations: Conversation[];
  private _idCounter: number;
  private _maxConversations: number;

  constructor(maxConversations = 1000) {
    this._currentConversation = new Conversation(0);
    this._conversations = [this._currentConversation];
    this._idCounter = 1;
    this._maxConversations = maxConversations;
  }

  get currentConversation(): Conversation {
    return this._currentConversation;
  }

  get conversations(): Conversation[] {
    return this._conversations;
  }

  public setConversationAsActive(id: number): void {
    for (const c of this._conversations) {
      if (c.id === id) {
        log.info(`set the current convo`);
        this._currentConversation = c;
      }
    }
  }

  public startNewConversation(exportFilePath?: string, setViews = false): void {
    if (!this._currentConversation.isEmpty()) {
      if (this._conversations.length >= this._maxConversations) {
        // Remove the oldest conversation
        const oldestConversation = this._conversations.shift();
      }
      // Save the current conversation before starting a new one
      this.saveCurrentConversation(exportFilePath, setViews);
      const newConversation = new Conversation(this._idCounter);
      this._idCounter++;
      this._currentConversation = newConversation;
      this._conversations.push(newConversation);
    }
  }

  public saveAndStartNewConversation(
    exportFilePath?: string,
    setViews = false
  ): void {
    if (!this._currentConversation.isEmpty()) {
      this.startNewConversation(exportFilePath, setViews);
    }
  }

  public addConversation(
    id: number,
    messages: IMessage[],
    views: IView[]
  ): void {
    this.startNewConversation();
    this._currentConversation.id = id;
    if (id >= this._idCounter) {
      this._idCounter = id + 1;
    }
    this._currentConversation.addIMessages(messages);
    this._currentConversation.addIViews(views);
  }

  public addMessagesToCurrent(
    messages: ChatCompletionRequestMessage[] | ChatCompletionResponseMessage[],
    name?: string
  ) {
    for (const message of messages) {
      this._currentConversation.addMessage(message, name);
    }
  }

  public addViewsToCurrent(views: IView[]) {
    this._currentConversation.addIViews(views);
  }

  public exportConversations(filePath: string, setViews = false): void {
    for (const conversation of this._conversations) {
      conversation.exportConversation(filePath, setViews);
    }
  }

  public saveCurrentConversation(
    exportFilePath?: string,
    setViews = false
  ): void {
    if (!exportFilePath) {
      return;
    }
    // Truncate file if it exists
    if (fs.existsSync(exportFilePath)) {
      // Truncate the file to 0 size by opening it in 'w' mode
      fs.open(exportFilePath, 'w', (err, file) => {
        if (err) {
          throw err;
        }

        // Close the file to complete the truncation process
        fs.close(file, err => {
          if (err) {
            throw err;
          }
        });
      });
    } else {
      log.info(`File ${exportFilePath} does not exist.`);
    }
    this.exportConversations(exportFilePath, setViews);
  }

  public getConversationListSummary(
    lastN: number = 20
  ): { label: number; description: string }[] {
    if (
      this._conversations.length === 1 &&
      this._conversations[0].getMessageStream().length === 0
    ) {
      return [];
    }
    const convoSlice = this._conversations.slice(-lastN).reverse();
    const conversationList: { label: number; description: string }[] = [];
    for (const c of convoSlice) {
      if (c.getMessageStream().length > 0) {
        conversationList.push({
          label: c.id,
          description: `${c.id}: ${c
            .getMessageStream()[0]
            .content.substring(0, 32)}...`
        });
      }
    }
    return conversationList;
  }
}
