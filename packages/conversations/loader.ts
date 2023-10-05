import * as fs from "fs";
import * as yaml from "js-yaml";

import {
  IMessage,
  IView
} from "spec/chat";

import { log } from "logger/log";
import { ConversationCollection } from "@/collection";

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
