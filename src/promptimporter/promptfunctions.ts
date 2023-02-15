import { append, replace, writeFile } from "../vscodeutils/predefinedfunctions";

import { createFunctionFromString } from "./promptutils";

export class FunctionWrapper {
  _function: Function;

  constructor(public name: string, fn: Function) {
    this._function = fn;
  }

  run(...args: any[]) {
    return this._function(...args);
  }

  static fromString(fnString: string) {
    try {
      const { name, fn } = createFunctionFromString(fnString) as {
        name: string;
        fn: Function;
      };
      return new FunctionWrapper(name, fn);
    } catch (error) {
      throw new Error(
        `Failed to create function from string. Error: "${error}"`
      );
    }
  }

  static fromFunction(fn: Function) {
    return new FunctionWrapper(fn.name, fn);
  }
}

export const preDefinedFunctions = [
  new FunctionWrapper("append", append),
  new FunctionWrapper("replace", replace),
  new FunctionWrapper("writeFile", writeFile),
  new FunctionWrapper("noop", function noop() {}),
];

export class FunctionContext {
  functions: { [key: string]: FunctionWrapper };

  constructor() {
    this.functions = {};
  }

  set(fn: FunctionWrapper) {
    this.functions[fn.name] = fn;
  }

  get(functionName: string): FunctionWrapper | undefined {
    return this.functions[functionName];
  }

  getFunctions(): { [key: string]: (...args: any[]) => any } {
    const result: { [key: string]: any } = {};
    Object.keys(this.functions).forEach((key) => {
      const fn = this.functions[key];
      if (fn) {
        result[key] = fn._function;
      }
    });
    return result;
  }
}
