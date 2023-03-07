import * as fs from "fs";
import * as yaml from "js-yaml";
import log from "../logger/log";

import {
  ChatCompletionRoleEnum,
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
  IMessage,
} from "./conversationspec";

export class Conversation {
  private messages: IMessage[];
  public id: number;

  constructor(id: number) {
    this.messages = [];
    this.id = id;
  }

  public isEmpty(): boolean {
    return this.messages.length === 0;
  }

  public addIMessages(messages: IMessage[]) {
    this.messages = this.messages.concat(messages);
  }

  public addMessage(
    message: ChatCompletionRequestMessage | ChatCompletionResponseMessage,
    name?: string
  ): void {
    if (!(message.role in ChatCompletionRoleEnum)) {
      throw new Error(`Invalid message role: ${message.role}`);
    }

    const timestamp = new Date(Date.now()).toISOString();
    const role = message.role;
    const content = message.content;
    const newMessage: IMessage = { role, content, timestamp, name };
    this.messages.push(newMessage);
  }

  public getMessageStream(): IMessage[] {
    if (this.messages.length === 0) {
      // log.info("No messages found in conversation");
      return [];
    }
    return this.messages;
  }

  public getMessagesAsRequests(): ChatCompletionRequestMessage[] {
    let messages: ChatCompletionRequestMessage[] = [];
    let sortedMessages = this.messages.slice().sort((a, b) => {
      let t1 = new Date(a.timestamp);
      let t2 = new Date(b.timestamp);
      if (t1 < t2) {
        return -1;
      } else if (t1 > t2) {
        return 1;
      }
      return 0;
    });
    for (const message of sortedMessages) {
      messages.push({
        role: message.role,
        content: message.content,
        name: message.name,
      });
    }
    return messages;
  }

  public getConversationYML(): string {
    if (this.messages.length === 0) {
      return "";
    }

    const messages = this.messages.map((message) => ({
      name: message.name,
      role: message.role,
      timestamp: message.timestamp,
      content: message.content,
    }));

    const conversationYaml = yaml.dump([
      {
        id: this.id,
        messages: messages,
      },
    ]);

    return conversationYaml;
  }

  public exportConversation(filePath: string): void {
    const conversationYaml = this.getConversationYML();
    if (!conversationYaml) {
      return;
    }
    if (!fs.existsSync(filePath)) {
      // Create a new empty file
      fs.writeFileSync(filePath, conversationYaml);
      // log.info(`File created successfully at ${filePath}.`);
    } else {
      fs.appendFileSync(filePath, conversationYaml);
      // log.info(`Conversation saved to ${filePath}`);
    }
  }
}

export class ConversationCollection {
  private _currentConversation: Conversation;
  private _conversations: Conversation[];
  private _idCounter: number;
  private _maxConversations: number;

  constructor(maxConversations: number = 1000) {
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

  public startNewConversation(exportFilePath?: string): void {
    if (!this._currentConversation.isEmpty()) {
      if (this._conversations.length >= this._maxConversations) {
        // Remove the oldest conversation
        const oldestConversation = this._conversations.shift();
      }
      // Save the current conversation before starting a new one
      this.saveCurrentConversation(exportFilePath);
      const newConversation = new Conversation(this._idCounter);
      this._idCounter++;
      this._currentConversation = newConversation;
      this._conversations.push(newConversation);
    }
  }

  public saveAndStartNewConversation(exportFilePath?: string): void {
    if (!this._currentConversation.isEmpty()) {
      this.startNewConversation(exportFilePath);
    }
  }

  public addConversation(id: number, messages: IMessage[]): void {
    this.startNewConversation();
    this._currentConversation.id = id;
    if (id >= this._idCounter) {
      this._idCounter = id + 1;
    }
    this._currentConversation.addIMessages(messages);
  }

  public addMessagesToCurrent(
    messages: ChatCompletionRequestMessage[] | ChatCompletionResponseMessage[],
    name?: string
  ) {
    for (const message of messages) {
      this._currentConversation.addMessage(message, name);
    }
  }

  public exportConversations(filePath: string): void {
    for (const conversation of this._conversations) {
      conversation.exportConversation(filePath);
    }
  }

  public saveCurrentConversation(exportFilePath?: string): void {
    if (!exportFilePath) {
      return;
    }
    // Truncate file if it exists
    if (fs.existsSync(exportFilePath)) {
      // Truncate the file to 0 size by opening it in 'w' mode
      fs.open(exportFilePath, "w", (err, file) => {
        if (err) throw err;

        // Close the file to complete the truncation process
        fs.close(file, (err) => {
          if (err) throw err;
        });
      });
    } else {
      log.info(`File ${exportFilePath} does not exist.`);
    }
    this.exportConversations(exportFilePath);
  }
}

export function loadConversations(
  filePath: string
): ConversationCollection | null {
  try {
    let conversationsData: string;
    const conversationCollection = new ConversationCollection();
    try {
      conversationsData = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        // File doesn't exist, create a new one
        log.info(`Creating new file at: ${filePath}`);
        fs.writeFileSync(filePath, "");
        conversationsData = "";
      } else {
        throw err;
      }
    }
    if (!conversationsData) {
      return conversationCollection;
    }
    let conversations = yaml.load(conversationsData) as {
      id: number;
      messages: IMessage[];
    }[];
    conversations.sort((a, b) => a.id - b.id);
    if (!Array.isArray(conversations)) {
      throw new Error("Invalid conversations file format");
    }

    for (const conversationData of conversations) {
      if (
        !conversationData ||
        typeof conversationData.id !== "number" ||
        !Array.isArray(conversationData.messages)
      ) {
        throw new Error("Invalid conversation data format");
      }
      conversationCollection.addConversation(
        conversationData.id,
        conversationData.messages
      );
      // log.info(
      //   `loaded conversation: ${JSON.stringify(conversationData, null, 2)}`
      // );
    }
    log.info(
      `current conversations counter is at: ${conversationCollection.currentConversation.id}`
    );
    return conversationCollection;
  } catch (err) {
    log.error(`Error loading conversations from ${filePath}: ${err}`);
    return null;
  }
}
