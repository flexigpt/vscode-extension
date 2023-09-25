
import { expect } from "chai";
import { suite, test } from "mocha";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import OpenAIAPIProvider from "../../strategy/openaiapi";
import { CompletionProvider } from "../../strategy/strategy";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRoleEnum,
} from "../../strategy/conversationspec";

suite("CheckParams Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests for checkparams.");
  const apiKey = "MyKey";
  const defaultCompletionModel = "gpt-3.5-turbo";
  const defaultChatCompletionModel = "gpt-3.5-turbo";
  const timeout = 60;
  const defaultOrigin = "https://api.openai.com";
  const chatCompletion: CompletionProvider = new OpenAIAPIProvider(
    apiKey,
    timeout,
    defaultCompletionModel,
    defaultChatCompletionModel,
    defaultOrigin,
  );
  const prompt = "Hello, how can I assist you?";
  const messages: ChatCompletionRequestMessage[] = [
    {
      role: ChatCompletionRoleEnum.user,
      content: "I need help with my account",
    },
  ];

  test("should handle null prompt and null messages", () => {
    const completionParams = chatCompletion.checkAndPopulateCompletionParams(
      null,
      null
    );
    expect(completionParams).to.deep.equal({
      model: "gpt-3.5-turbo",
      prompt: null,
      messages: null,
      functionCall: undefined,
      functions: undefined,
      suffix: undefined,
      maxTokens: undefined,
      temperature: 0.1,
      topP: undefined,
      n: undefined,
      stream: false,
      logprobs: undefined,
      echo: undefined,
      stop: undefined,
      presencePenalty: 0.0,
      frequencyPenalty: 0.5,
      bestOf: 1,
      logitBias: undefined,
      user: undefined,
    });
  });

  test("should handle undefined inputParams", () => {
    const completionParams = chatCompletion.checkAndPopulateCompletionParams(
      "Hello once",
      [{ role: ChatCompletionRoleEnum.user, content: "Hello twice" }]
    );
    expect(completionParams).to.deep.equal({
      model: "gpt-3.5-turbo",
      prompt: null,
      messages: [
        { role: ChatCompletionRoleEnum.user, content: "Hello twice" },
        { role: ChatCompletionRoleEnum.user, content: "Hello once" },
      ],
      functionCall: undefined,
      functions: undefined,
      suffix: undefined,
      maxTokens: undefined,
      temperature: 0.1,
      topP: undefined,
      n: undefined,
      stream: false,
      logprobs: undefined,
      echo: undefined,
      stop: undefined,
      presencePenalty: 0.0,
      frequencyPenalty: 0.5,
      bestOf: 1,
      logitBias: undefined,
      user: undefined,
    });
  });

  test("should handle zero input values", () => {
    const completionParams = chatCompletion.checkAndPopulateCompletionParams(
      "",
      null,
      {
        model: "curie",
        maxTokens: 0,
        temperature: 0,
        presencePenalty: 0,
        frequencyPenalty: 0,
        bestOf: 0,
      }
    );
    expect(completionParams).to.deep.equal({
      model: "curie",
      prompt: "",
      messages: null,
      suffix: undefined,
      maxTokens: 0,
      temperature: 0,
      topP: undefined,
      n: undefined,
      stream: false,
      logprobs: undefined,
      echo: undefined,
      stop: undefined,
      presencePenalty: 0,
      frequencyPenalty: 0,
      bestOf: 0,
      logitBias: undefined,
      user: undefined,
    });
  });

  test("should handle happy path values in chat model", () => {
    const completionParams = chatCompletion.checkAndPopulateCompletionParams(
      "Hello2",
      [{ role: ChatCompletionRoleEnum.user, content: "Hello1" }],
      {
        model: "gpt-3.5-turbo",
        maxTokens: 1024,
        temperature: 0.5,
        presencePenalty: 0.8,
        frequencyPenalty: 0.2,
        bestOf: 3,
        logitBias: { Hello: 0.8 },
        user: "1234",
      }
    );
    expect(completionParams).to.deep.equal({
      model: "gpt-3.5-turbo",
      prompt: null,
      messages: [
        { role: "user", content: "Hello1" },
        { role: "user", content: "Hello2" },
      ],
      functionCall: undefined,
      functions: undefined,
      suffix: undefined,
      maxTokens: 1024,
      temperature: 0.5,
      topP: undefined,
      n: undefined,
      stream: false,
      logprobs: undefined,
      echo: undefined,
      stop: undefined,
      presencePenalty: 0.8,
      frequencyPenalty: 0.2,
      bestOf: 3,
      logitBias: { Hello: 0.8 },
      user: "1234",
    });
  });
  test("should handle happy path values in non chat model", () => {
    const completionParams = chatCompletion.checkAndPopulateCompletionParams(
      "Hello2",
      [{ role: ChatCompletionRoleEnum.user, content: "Hello1" }],
      {
        model: "curie",
        maxTokens: 1024,
        temperature: 0.5,
        presencePenalty: 0.8,
        frequencyPenalty: 0.2,
        bestOf: 3,
        logitBias: { Hello: 0.8 },
        user: "1234",
      }
    );
    expect(completionParams).to.deep.equal({
      model: "curie",
      prompt: "Hello2",
      messages: [
        { role: "user", content: "Hello1" },
        { role: "user", content: "Hello2" },
      ],
      suffix: undefined,
      maxTokens: 1024,
      temperature: 0.5,
      topP: undefined,
      n: undefined,
      stream: false,
      logprobs: undefined,
      echo: undefined,
      stop: undefined,
      presencePenalty: 0.8,
      frequencyPenalty: 0.2,
      bestOf: 3,
      logitBias: { Hello: 0.8 },
      user: "1234",
    });
  });
});
