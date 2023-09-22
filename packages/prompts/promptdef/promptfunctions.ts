import { log } from "@/logger/log";

export function createFunctionFromString(fnString: string): {
  name: string;
  fn: Function;
} | null {
  try {
    const match = fnString.match(/function\s+(\w+)\(([^)]*)\)\s*\{([\s\S]*)\}/);
    if (!match) {
      throw new Error(
        `The string "${fnString}" doesn't match the expected format of a function.`
      );
    }
    const name = match[1];
    const args = match[2].split(",").map((arg) => arg.trim());
    const body = match[3];
    const fn = new Function(...args, body);
    return { name, fn };
  } catch (error) {
    log.error(error);
    return null;
  }
}

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


