import { systemVariableNames } from "./predefinedvariables";

import { FunctionWrapper, FunctionContext } from "../promptdef/promptfunctions";
import { Variable, VariableContext } from "../promptdef/promptvariables";
import { Command } from "../promptdef/promptcommand";

export const DEFAULT_COMMAND: string = "Ask";
export const DEFAULT_NAMESPACE: string = "FlexiGPT";
export const DEFAULT_RESPONSE_HANDLER: string = "noop";

export class CommandRunnerContext {
  fullVariableContext: VariableContext;
  functionContext: { [namespace: string]: FunctionContext };
  commands: { [namespace: string]: { [key: string]: Command } };

  constructor() {
    this.fullVariableContext = new VariableContext();
    this.fullVariableContext.addNamespace("system");
    this.fullVariableContext.setDefaultNamespace("system");
    this.functionContext = { system: new FunctionContext() };
    this.commands = {};
    this.addCommand(
      new Command(
        DEFAULT_COMMAND,
        "Ask",
        DEFAULT_RESPONSE_HANDLER,
        "Ask any thing to FlexiGPT",
        DEFAULT_NAMESPACE
      )
    );
  }

  getUserReplaced(text: string, namespace: string): string {
    // first replace `{user.` with `{namespace.`
    text = text.replace(/\{user\./g, `{${namespace}.`);
    // then replace `user.` with `namespace.`
    text = text.replace(/user\./g, `${namespace}.`);
    return text;
  }

  runResponseHandler(
    command: Command,
    responseHandler: string | { func: string; args: any } | undefined
  ): any {
    // log.info(`resolved sys vars: ${JSON.stringify(system)} resolved user vars: ${JSON.stringify(user)}`);

    let functionName: string;
    let args: { [key: string]: any } = {};
    responseHandler = responseHandler ?? DEFAULT_RESPONSE_HANDLER;
    if (responseHandler === "") {
      responseHandler = DEFAULT_RESPONSE_HANDLER;
    }
    if (typeof responseHandler === "string") {
      functionName = responseHandler;
    } else {
      functionName = responseHandler.func;
      if (responseHandler.args) {
        for (const [key, value] of Object.entries(responseHandler.args)) {
          let v = value as string;
          v = this.getUserReplaced(v, command.namespace);
          args[key] = this.fullVariableContext.getValue(v);
        }
      }
    }
    // add the answer arg as extra 
    args["answer"] = this.fullVariableContext.getValue("system.answer");
    let fn = this.functionContext[command.namespace].get(
      functionName
    ) as FunctionWrapper;
    if (!fn) {
      fn = this.functionContext["system"].get(functionName) as FunctionWrapper;
    }
    return fn?.run({
      ...args,
    });
  }

  setSystemVariable(variable: Variable): void {
    this.fullVariableContext.getNamespace("system")?.addVariable(variable);
  }

  getSystemVariable(key: string): any {
    this.fullVariableContext.getNamespace("system")?.getValue(key);
  }

  setUserVariable(namespace: string, variable: Variable): void {
    if (!this.fullVariableContext.getNamespace(namespace)) {
      this.fullVariableContext.addNamespace(namespace);
    }
    this.fullVariableContext.getNamespace(namespace)?.addVariable(variable);
  }

  setSystemFunction(fn: FunctionWrapper): void {
    this.functionContext["system"].set(fn);
  }

  setFunction(namespace: string, fn: FunctionWrapper): void {
    if (!this.functionContext[namespace]) {
      this.functionContext[namespace] = new FunctionContext();
    }
    this.functionContext[namespace].set(fn);
  }

  addCommand(command: Command): void {
    if (!this.commands[command.namespace]) {
      this.commands[command.namespace] = {};
    }
    this.commands[command.namespace][command.name] = command;
  }

  getCommands(): { [namespace: string]: { [key: string]: Command } } {
    return this.commands;
  }

  getAllCommandsAsLabels(): {
    label: string;
    description: string;
    command: Command;
  }[] {
    const commandList = Object.keys(this.commands)
      .flatMap((namespaceKey) => Object.values(this.commands[namespaceKey]))
      .map((command: Command) => ({
        label: `[${command.namespace}] ${command.name}`,
        description: command.description,
        command: command,
      }));
    return commandList;
  }

  fixhangingString(inStr: string, seperator: string): string {
    let updatedValue = inStr;
    if (inStr?.includes(seperator)) {
      updatedValue =
        inStr.split(seperator).length % 2 === 1
          ? inStr
          : inStr + `\n${seperator}\n`;
    }
    return updatedValue;
  }

  processAnswer(command: Command, answer: string, docLanguage: string): any {
    if (!answer) {
      answer = "";
      this.setSystemVariable(new Variable(systemVariableNames.answer, answer));
      return answer;
    }

    let updatedValue = this.fixhangingString(answer, '"""');
    updatedValue = this.fixhangingString(updatedValue, "```");
    if (!updatedValue.includes("```")) {
      // log.info(`Got value ${JSON.stringify(updatedValue)}`);
      // There is no code block marked in the answer as of now. Check if we need to mark it.
      const codePattern =
        /\b(function|def|func|public\ static|FUNCTION|const|var|\{[^}]*\})\b/gi;
      const containsCode = codePattern.test(updatedValue);
      if (containsCode) {
        // log.info(`Got contains code`);
        // Just put a blanket language marker
        updatedValue = "\n```" + docLanguage + "\n" + updatedValue + "\n```\n";
      }
    }
    // const updatedValueStr = prettier.format(updatedValue, { parser: 'json' });
    this.setSystemVariable(
      new Variable(systemVariableNames.answer, answer)
    );
    this.setSystemVariable(
      new Variable(systemVariableNames.sanitizedAnswer, updatedValue)
    );
    return this.runResponseHandler(command, command.responseHandler);
  }

  findCommand(text: string): Command {
    let commands = this.getAllCommandsAsLabels();
    let returnitem = new Command(
      DEFAULT_COMMAND,
      text,
      "explain",
      "Get any explanation from FlexiGPT",
      DEFAULT_NAMESPACE
    );
    const filteredCommands = commands.filter((command: { label: string }) =>
      command.label.startsWith(text)
    );
    if (filteredCommands.length > 0) {
      returnitem = filteredCommands[0].command;
    }
    return returnitem;
  }

  prepare(command: Command): string {
    // log.info(`question template input: ${this.questionTemplate}`);
    // let matches = this.questionTemplate.match(/\{([^}]+)\}/g);
    // log.info(`question template input: ${this.questionTemplate}. Matches: ${matches}`);
    const question = command.questionTemplate.replace(
      /\{([^}]+)\}/g,
      (match, key) => {
        key = this.getUserReplaced(key, command.namespace);
        let v = this.fullVariableContext.getValue(key);
        return v;
      }
    );

    return question;
  }

  extractTextWithinSquareBrackets(input: string): {
    bracketText: string | null;
    remainingText: string;
  } {
    const regex = /^\[(.*?)\](.*)/; // Regular expression to match the text within square brackets at the start of the string
    const matches = input.match(regex); // Perform the matching

    if (matches && matches.length > 2) {
      const bracketText = matches[1].trim(); // Trim leading/trailing whitespace from the bracket text
      const remainingText = matches[2].trim(); // Trim leading/trailing whitespace from the remaining text

      return {
        bracketText: bracketText,
        remainingText: remainingText,
      };
    }

    return {
      bracketText: null,
      remainingText: input.trim(), // If no match is found, treat the whole input as the remaining text
    };
  }

  prepareAndSetCommand(
    text: string,
    suffix?: string
  ): { question: string; command: Command } {
    let command = this.findCommand(text);
    let question = this.prepare(command);
    if (suffix) {
      question += suffix;
    }

    this.setSystemVariable(
      new Variable(systemVariableNames.question, question)
    );
    return { question, command };
  }
}