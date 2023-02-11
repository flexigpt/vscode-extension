import { getValueWithKey } from "./promptutils";
import { systemVariableNames } from "../vscodeutils/predefinedvariables";

import {
  FunctionWrapper,
  FunctionContext,
  preDefinedFunctions,
} from "./promptfunctions";
import { Variable, VariableContext } from "./promptvariables";

export const DEFAULT_ASK_ANYTHING: string = "Ask";
const DEFAULT_COMMAND_HANDLER: string = "replace";

export class Command {
  constructor(
    public name: string,
    public questionTemplate: string,
    public handler: any,
    public description: string = name
  ) {}

  prepare(systemVariables: any, userVariables: any) {
    const variables = {
      system: systemVariables,
      user: userVariables,
    };
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
        DEFAULT_ASK_ANYTHING,
        "Explain",
        "explain",
        "any thing to FlexiGPT"
      )
    );
  }

  runHandler(handler: string | { func: string; args: any } | undefined): void {
    const system = this.systemVariableContext.getVariables();
    const functions = this.functionContext.getFunctions();
    const user = this.userVariableContext.getVariables(system, functions);
    const variables = { system, user };

    let functionName: string;
    let args: { [key: string]: any } = {};
    handler = handler ?? DEFAULT_COMMAND_HANDLER;
    if (typeof handler === "string") {
      functionName = handler;
    } else {
      functionName = handler.func;
      if (handler.args) {
        for (const [key, value] of Object.entries(handler.args)) {
          args[key] = getValueWithKey(value as string, variables);
        }
      }
    }
    const fn = this.functionContext.get(functionName) as FunctionWrapper;
    fn.run({
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

  prepareAndSetCommand(text: string, suffix?: string): string {
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
    return question;
  }

  findCommand(text: string): Command {
    let commands = this.getCommands();
    let returnitem = new Command(
      DEFAULT_ASK_ANYTHING,
      "Explain" + " : " + text,
      "explain",
      "any thing to FlexiGPT"
    );
    for (let item of commands) {
      if (item.name === text) {
        returnitem = item;
        break;
      }
    }
    return returnitem;
  }
}

export function getCommandRunnerContext(): CommandRunnerContext {
  let commandRunnerContext = initContext();
  // if (!commandRunnerContext) {
  //   commandRunnerContext = initContext();
  // }
  return commandRunnerContext;

  function initContext(): CommandRunnerContext {
    const commandRunnerContext = new CommandRunnerContext();
    if (preDefinedFunctions) {
      for (const fn of preDefinedFunctions) {
        commandRunnerContext.setFunction(fn);
      }
    }
    return commandRunnerContext;
  }
}
