import * as assert from "assert";
import { expect } from "chai";
import { describe, it } from "mocha";
import yaml from "js-yaml";
import fs from "fs";

import {
  ChatCompletionRoleEnum,
} from "@/spec/chat";
import { Conversation } from "@/conversations/conversation";

describe("Conversation", () => {
  describe("addMessage", () => {
    it("should add a valid ChatCompletionRequestMessage", () => {
      const conversation = new Conversation(1);
      conversation.addMessage({
        role: ChatCompletionRoleEnum.user,
        content: "Hello, World!",
      }, "Alice");

      expect(conversation.getMessageStream()).to.deep.equal([{
        role: ChatCompletionRoleEnum.user,
        content: "Hello, World!",
        timestamp: conversation.getMessageStream()[0].timestamp, // timestamp will be automatically generated
        name: "Alice",
      }]);
    });

    it("should add a valid ChatCompletionResponseMessage", () => {
      const conversation = new Conversation(1);
      const message = {
        role: "assistant" as ChatCompletionRoleEnum,
        content: "How can I assist you?",
      };
      conversation.addMessage(message);

      const expectedMessage = {
        role: "assistant" as ChatCompletionRoleEnum,
        content: "How can I assist you?",
        timestamp: conversation.getMessageStream()[0].timestamp, // timestamp will be automatically generated
        name: undefined,
      };

      expect(conversation.getMessageStream()).to.deep.equal([expectedMessage]);
    });

    it("should throw an error for an invalid message role", () => {
      const conversation = new Conversation(1);
      const invalidMessage = {
        role: "InvalidRole" as any,
        content: "This message should not be added",
      };

      expect(() => conversation.addMessage(invalidMessage)).to.throw(
        "Invalid message role: InvalidRole"
      );
      expect(conversation.getMessageStream()).to.deep.equal([]);
    });
  });

  describe("exportConversation", () => {
    it("should export the conversation to a YAML file", () => {
      const conversation = new Conversation(1);
      conversation.addMessage({
        role: ChatCompletionRoleEnum.user,
        content: "Hello, World!",
      });
      conversation.addMessage({
        role: ChatCompletionRoleEnum.assistant,
        content: "How can I assist you?",
      });

      const filePath = "./conversation.yml";
      conversation.exportConversation(filePath);

      // Verify that the file exists and contains the expected YAML

      const messages = conversation.getMessageStream().map((message) => ({
        name: message.name,
        role: message.role,
        timestamp: message.timestamp,
        content: message.content,
      }));
      const expectedYaml = yaml.dump([
        {
          id: 1,
          messages: messages,
        },
      ]);
      const actualYaml = fs.readFileSync(filePath, "utf8");
      expect(actualYaml).to.equal(expectedYaml);

      // Clean up the file after the test
      fs.unlinkSync(filePath);
    });

    // it("should log an error if there is an error saving the conversation", () => {
    //   const conversation = new Conversation(1);
    //   conversation.addMessage({
    //     role: ChatCompletionRoleEnum.user,
    //     content: "Hello, World!",
    //   });

    //   const filePath = "./invalid/path/conversation.yml";
    //   conversation.exportConversation(filePath);

    //   // Verify that the error was logged
    //   //   const expectedLog = `Error saving conversation: Error: ENOENT: no such file or directory, open '${filePath}'`;
    //   //   const logs = console. as string[]; // Cast console.logs to string[]
    //   //   const actualLog = logs.find(log => log.includes('Error saving conversation'));

    //   //   expect(actualLog).to.equal(expectedLog);
    // });
  });
});
