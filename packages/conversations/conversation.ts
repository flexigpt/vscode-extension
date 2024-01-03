import * as fs from "fs";
import * as yaml from "js-yaml";
import { nanoid } from "nanoid";

import {
  ChatCompletionRoleEnum,
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
  IMessage,
  IView
} from "spec/chat";

// import { log } from "./logger/log";

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
    const id = nanoid();
    const newMessage: IMessage = { id, role, content, timestamp, name };
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
      if (!a.timestamp || !b.timestamp) {
        return 0;
      }
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

