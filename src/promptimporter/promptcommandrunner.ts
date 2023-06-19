
import { systemVariableNames } from "./predefinedvariables";

import { FunctionWrapper, FunctionContext } from "../promptdef/promptfunctions";
import { Variable, VariableContext, getValueWithKey } from "../promptdef/promptvariables";
import { Command } from "../promptdef/promptcommand";


export const DEFAULT_COMMAND: string = "Ask";
export const DEFAULT_RESPONSE_HANDLER: string = "noop";


export class CommandRunnerContext {
  systemVariableContext: VariableContext;
  userVariableContext: VariableContext;
  functionContext: FunctionContext;
  commands: { [key: string]: Command };

  constructor() {
    this.systemVariableContext = new VariableContext();
    this.userVariableContext = new VariableContext();
    this.functionContext = new FunctionContext();
    this.commands = {};
    this.addCommand(
      new Command(
        DEFAULT_COMMAND,
        "Explain",
        "explain",
        "any thing to FlexiGPT"
      )
    );
  }

  runResponseHandler(
    responseHandler: string | { func: string; args: any } | undefined
  ): any {
    let system = this.systemVariableContext.getVariablesWithValues();
    let functions = this.functionContext.getFunctions();
    let user = this.userVariableContext.getVariablesWithValues(system, functions);
    // log.info(`resolved sys vars: ${JSON.stringify(system)} resolved user vars: ${JSON.stringify(user)}`);
    let variables = { system, user };

    let functionName: string;
    let args: { [key: string]: any } = {};
    responseHandler = responseHandler ?? DEFAULT_RESPONSE_HANDLER;
    if (typeof responseHandler === "string") {
      functionName = responseHandler;
    } else {
      functionName = responseHandler.func;
      if (responseHandler.args) {
        for (const [key, value] of Object.entries(responseHandler.args)) {
          args[key] = getValueWithKey(value as string, variables);
        }
      }
    }
    const fn = this.functionContext.get(functionName) as FunctionWrapper;
    return fn?.run({
      ...args,
      ...variables,
    });
  }

  setSystemVariable(variable: Variable): void {
    this.systemVariableContext.set(variable);
  }

  setUserVariable(variable: Variable): void {
    this.userVariableContext.set(variable);
  }

  setFunction(fn: FunctionWrapper): void {
    this.functionContext.set(fn);
  }

  addCommand(command: Command): void {
    this.commands[command.name] = command;
  }

  getCommands(): Command[] {
    return Object.values(this.commands);
  }

  findCommand(text: string): Command {
    let commands = this.getCommands();
    let returnitem = new Command(
      DEFAULT_COMMAND,
      text,
      "explain",
      "Get any explanation from FlexiGPT"
    );
    for (let item of commands) {
      if (item.name === text) {
        returnitem = item;
        break;
      }
    }
    return returnitem;
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
      const codePattern = /\b(function|def|func|public\ static|FUNCTION|const|var|\{[^}]*\})\b/gi;
      const containsCode = codePattern.test(updatedValue);
      if (containsCode) {
        // log.info(`Got contains code`);
        // Just put a blanket language marker
        updatedValue = "\n```" + docLanguage + "\n" + updatedValue + "\n```\n";
      }
    }
    // const updatedValueStr = prettier.format(updatedValue, { parser: 'json' });

    this.setSystemVariable(
      new Variable(systemVariableNames.answer, updatedValue)
    );
    return this.runResponseHandler(command.responseHandler);
  }

  prepareAndSetCommand(
    text: string,
    suffix?: string
  ): { question: string; command: Command } {
    let command = this.findCommand(text);
    const system = this.systemVariableContext.getVariablesWithGetters();
    const functions = this.functionContext.getFunctions();
    const user = this.userVariableContext.getVariablesWithGetters(this.systemVariableContext.getVariablesWithValues(), functions);
    let question = command.prepare(system, user);
    if (suffix) {
      question += suffix;
    }

    this.setSystemVariable(
      new Variable(systemVariableNames.question, question)
    );
    return { question, command };
  }
}
