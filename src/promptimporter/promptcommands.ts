import { getValueWithKey } from "./promptutils";
import { systemVariableNames } from "../vscodeutils/predefinedvariables";
import log from "../logger/log";

import { FunctionWrapper, FunctionContext } from "./promptfunctions";
import { Variable, VariableContext } from "./promptvariables";

export const DEFAULT_COMMAND: string = "Ask";
export const DEFAULT_RESPONSE_HANDLER: string = "noop";

export class Command {
  constructor(
    public name: string,
    public questionTemplate: string,
    public responseHandler: any,
    public description: string,
    public requestparams?: { [key: string]: any }
  ) {}

  prepare(systemVariables: any, userVariables: any) {
    const variables = {
      system: systemVariables,
      user: userVariables,
    };
    // log.info(`question template input: ${this.questionTemplate}`);
    // let matches = this.questionTemplate.match(/\{([^}]+)\}/g);
    // log.info(`question template input: ${this.questionTemplate}. Matches: ${matches}`);
    const question = this.questionTemplate.replace(
      /\{([^}]+)\}/g,
      (match, key) => {
        return getValueWithKey(key, variables);
      }
    );

    return question;
  }
}

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

  runResponseHandler(responseHandler: string | { func: string; args: any } | undefined): any {
    let system = this.systemVariableContext.getVariables();
    let functions = this.functionContext.getFunctions();
    let user = this.userVariableContext.getVariables(system, functions);
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

  processAnswer(command: Command, answer: string): any {
    this.setSystemVariable(new Variable(systemVariableNames.answer, answer));
    return this.runResponseHandler(command.responseHandler);
  }

  prepareAndSetCommand(
    text: string,
    suffix?: string
  ): { question: string; command: Command } {
    let command = this.findCommand(text);
    const system = this.systemVariableContext.getVariables();
    const functions = this.functionContext.getFunctions();
    const user = this.userVariableContext.getVariables(system, functions);
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
