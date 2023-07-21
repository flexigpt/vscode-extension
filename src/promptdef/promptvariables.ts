import log from "../logger/log";

export type VariableValue = any;
export type VariableGetter = (
  variables: { [name: string]: VariableValue },
  functions: any
) => VariableValue;

// Defines a class called Variable
export class Variable {
  // Declares a readonly property 'name' of type string, meaning it can't be changed after the instance is created
  readonly name: string;

  // Declares a private readonly property 'value' that can be of type VariableValue or a function of type VariableGetter
  private readonly value: VariableValue | VariableGetter;

  // The constructor for the Variable class, which takes a name and value or function
  constructor(name: string, value: VariableValue | VariableGetter) {
    // Validates if the name is a non-empty string, if not, throws an error
    if (typeof name !== "string" || !name) {
      throw new Error("Variable name must be a non-empty string");
    }

    // Assigns the given name and value/function to the instance properties
    this.name = name;
    this.value = value;
  }

  // Method to get the value of the variable instance. Optional parameters params and functions can be passed.
  getValue(params?: any, functions?: any): VariableValue {
    // Checks if the value is a function
    if (typeof this.value === "function") {
      // If params is an instance of VariableContext, create a proxy to get values from it
      const valueParams =
        params instanceof VariableContext
          ? new Proxy(
              {},
              {
                // A handler object for the Proxy which specifies a custom behavior for the property access
                get: (_, prop: string) => params.getValue(prop),
              }
            )
          : params;

      try {
        // Attempts to execute the function, passing the parameters and functions, and returns the result
        return (this.value as VariableGetter)(valueParams, functions);
      } catch (e) {
        // If there is an error during the function execution, logs it to the console and returns undefined
        log.error(`Error getting value for variable ${this.name}: ${e}`);
        return undefined;
      }
    }

    // If value is not a function, it returns the value directly
    return this.value;
  }
}

export class VariableContext {
  private readonly variables: Map<string, Variable | VariableContext>;
  private defaultNamespace: string | null;

  constructor() {
    this.variables = new Map();
    this.defaultNamespace = null;
  }

  setDefaultNamespace(namespace: string) {
    if (typeof namespace !== "string" || !namespace) {
      throw new Error("Namespace name must be a non-empty string");
    }
    if (!this.variables.has(namespace)) {
      throw new Error(`Namespace "${namespace}" does not exist`);
    }
    this.defaultNamespace = namespace;
  }

  addVariable(variable: Variable) {
    if (!(variable instanceof Variable)) {
      throw new Error("Invalid variable");
    }
    this.variables.set(variable.name, variable);
  }

  addNamespace(namespace: string) {
    if (typeof namespace !== "string" || !namespace) {
      throw new Error("Namespace name must be a non-empty string");
    }
    if (this.variables.has(namespace)) {
      throw new Error(`Namespace "${namespace}" already exists`);
    }
    this.variables.set(namespace, new VariableContext());
  }

  getNamespace(namespace: string): VariableContext | undefined {
    const ns = this.variables.get(namespace);
    return ns instanceof VariableContext ? ns : undefined;
  }

  getValue(key: string, functions?: any): VariableValue {
    if (typeof key !== "string" || !key) {
      log.error("Key must be a non-empty string");
      return undefined;
    }

    const keys = key.split(".");
    let value: any = this;
    for (const k of keys) {
      value =
        value instanceof VariableContext ? value.variables.get(k) : undefined;
      if (value === undefined) {
        // Try default namespace
        if (this.defaultNamespace && keys.length === 1) {
          return (
            this.getNamespace(this.defaultNamespace)?.getValue(
              key,
              functions
            ) ?? undefined
          );
        }
        return undefined;
      }
      if (typeof value === "function") {
        try {
          value = value();
        } catch (e) {
          log.error(`Error getting variable ${k}: ${e}`);
          return undefined;
        }
      }
    }
    return value instanceof Variable ? value.getValue(this, functions) : value;
  }
}
