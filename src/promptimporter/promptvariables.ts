export class Variable {
  private _value: any;

  constructor(public name: string, value: any) {
    if (value instanceof Function) {
      this.getter = value;
    } else {
      this._value = value;
    }
  }

  getter?: (params: any, functions: any) => any;

  get(params: any, functions: any) {
    if (this._value) {
      return this._value;
    }
    if (this.getter) {
      return this.getter(params, functions);
    }
  }

  prepareGetter(params: any, functions: any): () => any {
    let g = this.getter;
    let value = this._value;
    return function(): any {
      // console.log(`Getting value for ${param1} and ${param2}`);
      // Calculate value based on parameters
      if (value) {
        return value;
      }
      if (g) {
        return g(params, functions);
      }
    };
  }
}

export class VariableContext {
  variables: { [key: string]: Variable };

  constructor() {
    this.variables = {};
  }

  set(variable: Variable): void {
    this.variables[variable.name] = variable;
  }

  getVariablesWithGetters(params?: any, functions?: any): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    Object.keys(this.variables).forEach((key) => {
      const variable = this.variables[key];
      if (variable) {
        result[key] = variable.prepareGetter(params, functions);
      }
    });
    return result;
  }

  getVariableValue(key: string, params?: any, functions?: any): any {
    let ret = this.variables[key];
    if (ret) {
      return ret.get(params, functions);
    }
    return undefined;
  }
}
