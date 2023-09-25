import * as fs from "fs";
import * as yaml from "js-yaml";
import log from "../logger/log";

import {
  ChatCompletionRoleEnum,
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
  IMessage,
  IView
} from "./conversationspec";

export class Conversation {
  private messages: IMessage[];
  public id: number;
  public views: IView[];

  constructor(id: number) {
    this.messages = [];
    this.id = id;
    this.views = [];
  }

  public isEmpty(): boolean {
    return this.messages.length === 0;
  }

  public addIMessages(messages: IMessage[]) {
    this.messages = this.messages.concat(messages);
  }

  public addIViews(views: IView[]) {
    this.views = this.views.concat(views);
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
    const content: string = message.content ? message.content : "" ;
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
    const messages: ChatCompletionRequestMessage[] = [];
    const sortedMessages = this.messages.slice().sort((a, b) => {
      const t1 = new Date(a.timestamp);
      const t2 = new Date(b.timestamp);
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

  public getConversationYML(getViews = false): string {
    if (this.messages.length === 0) {
      return "";
    }

    const messages = this.messages.map((message) => ({
      name: message.name,
      role: message.role,
      timestamp: message.timestamp,
      content: message.content,
    }));

    if (getViews && this.views.length !== 0) {
      const views = this.views.map((view) => ({
        type: view.type,
        value: view.value,
        id: view.id,
        full: view.full,
        params: view.params,
      }));
      return yaml.dump([
        {
          id: this.id,
          messages: messages,
          views: views,
        },
      ]);
    }
    return yaml.dump([
      {
        id: this.id,
        messages: messages,
      },
    ]);
  }

  public exportConversation(filePath: string, setViews = false): void {
    const conversationYaml = this.getConversationYML(setViews);
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

  public saveAndStartNewConversation(exportFilePath?: string, setViews = false): void {
    if (!this._currentConversation.isEmpty()) {
      this.startNewConversation(exportFilePath, setViews);
    }
  }

  public addConversation(id: number, messages: IMessage[], views: IView[]): void {
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

  public addViewsToCurrent(
    views: IView[],
  ) {
    this._currentConversation.addIViews(views);
  }

  public exportConversations(filePath: string, setViews = false): void {
    for (const conversation of this._conversations) {
      conversation.exportConversation(filePath, setViews);
    }
  }

  public saveCurrentConversation(exportFilePath?: string, setViews = false): void {
    if (!exportFilePath) {
      return;
    }
    // Truncate file if it exists
    if (fs.existsSync(exportFilePath)) {
      // Truncate the file to 0 size by opening it in 'w' mode
      fs.open(exportFilePath, "w", (err, file) => {
        if (err) {throw err;}

        // Close the file to complete the truncation process
        fs.close(file, (err) => {
          if (err) {throw err;}
        });
      });
    } else {
      log.info(`File ${exportFilePath} does not exist.`);
    }
    this.exportConversations(exportFilePath, setViews);
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
      // eslint-disable-next-line no-undef
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
    const conversations = yaml.load(conversationsData) as {
      id: number;
      messages: IMessage[];
      views: IView[];
    }[];

    if (!conversations) {
      log.info(`No conversations found in ${filePath}`);
      return conversationCollection;
    }

    if (!Array.isArray(conversations)) {
      throw new Error("Invalid conversations file format");
    }
    conversations.sort((a, b) => a.id - b.id);

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
        conversationData.messages,
        conversationData.views,

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
