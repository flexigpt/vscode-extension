import { systemVariableNames } from "../promptimporter/predefinedvariables";

import { FunctionWrapper, FunctionContext } from "../promptdef/promptfunctions";
import { Variable, VariableNamespaces } from "../promptdef/promptvariables";
import { COMMAND_TYPE_CLI, Command } from "../promptdef/promptcommand";

// import { get } from "http";

export const DEFAULT_COMMAND = "Ask";
export const DEFAULT_NAMESPACE = "FlexiGPT";
export const DEFAULT_RESPONSE_HANDLER = "noop";

export class CommandRunnerContext {
  fullVariableNamespaces: VariableNamespaces;
  functionContext: { [namespace: string]: FunctionContext };
  commands: { [namespace: string]: { [key: string]: Command } };

  constructor() {
    this.fullVariableNamespaces = new VariableNamespaces();
    this.fullVariableNamespaces.addNamespace("system");
    this.fullVariableNamespaces.setDefaultNamespace("system");
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
  ): { sanitizedAnswer: string; ret: any } {
    // log.info(`resolved sys vars: ${JSON.stringify(system)} resolved user vars: ${JSON.stringify(user)}`);

    let functionName: string;
    const args: { [key: string]: any } = {};
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
          let val = this.fullVariableNamespaces.getValue(v);
          if (val === undefined) {
            val = v;
          }
          args[key] = val;
        }
      }
    }

    if (
      typeof responseHandler === "string" &&
      responseHandler === DEFAULT_RESPONSE_HANDLER
    ) {
      return {
        sanitizedAnswer: "",
        ret: "",
      };
    }

    // add the answer arg as extra
    args["answer"] = this.fullVariableNamespaces.getValue("system.answer");
    let fn = this.functionContext[command.namespace].get(
      functionName
    ) as FunctionWrapper;
    if (!fn) {
      fn = this.functionContext["system"].get(functionName) as FunctionWrapper;
    }
    const ret = fn?.run({
      ...args,
    });
    if (ret === undefined || ret === null) {
      return {
        sanitizedAnswer: `Ran response handler: ${
          command.namespace
        }:${functionName}`,
        ret: ret,
      };
    }
    return {
      sanitizedAnswer: `Ran response handler: ${
        command.namespace
      }:${functionName}\nOutput:\n${JSON.stringify(ret)}`,
      ret: ret,
    };
  }

  setSystemVariable(variable: Variable): void {
    this.fullVariableNamespaces.getNamespace("system")?.addVariable(variable);
  }

  getSystemVariable(key: string): any {
    return this.fullVariableNamespaces.getValue(`system.${key}`);
  }

  setUserVariable(namespace: string, variable: Variable): void {
    if (!this.fullVariableNamespaces.getNamespace(namespace)) {
      this.fullVariableNamespaces.addNamespace(namespace);
    }
    this.fullVariableNamespaces.getNamespace(namespace)?.addVariable(variable);
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

  getAllCommandsAsLabels(commandtype = "all"): {
    label: string;
    description: string;
    command: Command;
  }[] {
    const commandList = Object.keys(this.commands)
      .flatMap((namespaceKey) => Object.values(this.commands[namespaceKey]))
      .filter(
        (command: Command) =>
          commandtype === "all" || command.type === commandtype
      )
      .map((command: Command) => ({
        label:
          `[${command.namespace}]` +
          (command.type === COMMAND_TYPE_CLI
            ? `[${COMMAND_TYPE_CLI.toUpperCase()}]`
            : "") +
          ` ${command.name}`,
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
        /\b(function|def|func|public static|FUNCTION|const|var|\{[^}]*\})\b/gi;
      const containsCode = codePattern.test(updatedValue);
      if (containsCode) {
        // log.info(`Got contains code`);
        // Just put a blanket language marker
        updatedValue = "\n```" + docLanguage + "\n" + updatedValue + "\n```\n";
      }
    }
    // const updatedValueStr = prettier.format(updatedValue, { parser: 'json' });
    this.setSystemVariable(new Variable(systemVariableNames.answer, answer));
    const retval = this.runResponseHandler(command, command.responseHandler);
    if (retval.sanitizedAnswer !== "") {
      updatedValue = retval.sanitizedAnswer;
    }
    this.setSystemVariable(
      new Variable(systemVariableNames.sanitizedAnswer, updatedValue)
    );
    return retval.ret;
  }

  findCommand(text: string): Command {
    const commands = this.getAllCommandsAsLabels();
    let returnitem = new Command(
      DEFAULT_COMMAND,
      text,
      DEFAULT_RESPONSE_HANDLER,
      "Ask from FlexiGPT",
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

  createInputKeyAndArgs(input: string): [string, string[]] {
    const parts = input.split(' ');
    const key = parts.shift() || ''; // Take the first item as key, or use an empty string if undefined
    return [key, parts]; // Return the tuple
  }  

  getVarForKey(key: string, command: Command): string {
    if (key === "") {
      return "";
    }
    const k = this.getUserReplaced(key, command.namespace);
    let value = this.fullVariableNamespaces.getValue(k);
    if (value === undefined) {
      value = key;
    }
    return value;
  }

  prepare(command: Command): string {
    // log.info(`question template input: ${this.questionTemplate}`);
    // let matches = this.questionTemplate.match(/\{([^}]+)\}/g);
    // log.info(`question template input: ${this.questionTemplate}. Matches: ${matches}`);
    const question = command.questionTemplate.replace(
      /\{([^}]+)\}/g,
      (match, key) => {
        const inObj = this.createInputKeyAndArgs(key);
        if (inObj[0] === "") {
          return "";
        }
        const args: string[] = [];
        inObj[1].forEach((value, index) => {
          args[index] = this.getVarForKey(value, command);
        });
        const varKey = this.getUserReplaced(inObj[0], command.namespace);
        const v = this.fullVariableNamespaces.getValue(varKey, ...args);
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
    suffix?: string,
    setSystemVariable = true
  ): { question: string; command: Command } {
    const command = this.findCommand(text);
    let question = this.prepare(command);
    if (suffix) {
      question += suffix;
    }
    if (setSystemVariable) {
      this.setSystemVariable(
        new Variable(systemVariableNames.question, question)
      );
    }
    return { question, command };
  }
}
