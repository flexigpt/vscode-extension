import { log } from "@/logger/log";

// Defines a class called Variable
export class Variable {
  // Declares a readonly property 'name' of type string, meaning it can't be changed after the instance is created
  readonly name: string;

  // Declares a private readonly property 'value' that can be of type any
  private readonly value: any;

  // The constructor for the Variable class, which takes a name and value or function
  constructor(name: string, value: any) {
    // Validates if the name is a non-empty string, if not, throws an error
    if (typeof name !== "string" || !name) {
      throw new Error("Variable name must be a non-empty string");
    }

    // Assigns the given name and value/function to the instance properties
    this.name = name.toLowerCase();
    this.value = value;
  }

  // Method to get the value of the variable instance. Optional parameters params and functions can be passed.
  getVarValue(allVarsContext?: any, ...userArgs: any): any {
    // Checks if the value is a function
    if (typeof this.value === "function") {
      // log.info(`Got a value as function for variable ${this.name}`);
      // If params is an instance of VariableContext, create a proxy to get values from it
      const valueParams =
        allVarsContext instanceof VariableNamespaces
          ? new Proxy(
              {},
              {
                // A handler object for the Proxy which specifies a custom behavior for the property access
                get: (_, prop: string) => allVarsContext.getValue(prop),
              }
            )
          : allVarsContext;

      try {
        // Attempts to execute the function, passing the parameters and functions, and returns the result
        // log.info(`Getting value for variable ${this.name}. Params: ${JSON.stringify(valueParams)}`);
        return this.value(valueParams, ...userArgs);
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
  private readonly variables: Map<string, Variable>;

  constructor() {
    this.variables = new Map();
  }

  addVariable(variable: Variable) {
    if (!(variable instanceof Variable)) {
      throw new Error("Invalid variable");
    }
    this.variables.set(variable.name, variable);
  }

  getValue(key: string, allVarsContext: any, ...userArgs: any[]): any {
    if (typeof key !== "string" || !key) {
      log.error("Key must be a non-empty string");
      return undefined;
    }
    key = key.toLowerCase();
    // try to see if variable is present
    let value = this.variables.get(key);
    return value instanceof Variable
      ? value.getVarValue(allVarsContext, ...userArgs)
      : undefined;
  }
}

// The VariableNamespaces class handles the namespaces and manages the VariableContext objects
export class VariableNamespaces {
  private readonly namespaces: Map<string, VariableContext>;
  private defaultNamespace: string | null;

  constructor() {
    this.namespaces = new Map();
    this.defaultNamespace = null;
  }

  setDefaultNamespace(namespace: string) {
    if (typeof namespace !== "string" || !namespace) {
      throw new Error("Namespace name must be a non-empty string");
    }
    if (!this.namespaces.has(namespace)) {
      throw new Error(`Namespace "${namespace}" does not exist`);
    }
    this.defaultNamespace = namespace;
  }

  addNamespace(namespace: string) {
    if (typeof namespace !== "string" || !namespace) {
      throw new Error("Namespace name must be a non-empty string");
    }
    let name = namespace.toLowerCase();
    if (this.namespaces.has(name)) {
      throw new Error(`Namespace "${namespace}" already exists`);
    }
    this.namespaces.set(name, new VariableContext());
  }

  getNamespace(namespace: string): VariableContext | undefined {
    const ns = this.namespaces.get(namespace.toLowerCase());
    return ns instanceof VariableContext ? ns : undefined;
  }

  getValue(key: string, ...userArgs: any[]): any {
    if (typeof key !== "string" || !key) {
      log.error("Key must be a non-empty string");
      return undefined;
    }

    const keys = key.split(".");
    if (keys.length > 1) {
      const namespace = keys[0];
      const ns = this.getNamespace(namespace);
      if (ns) {
        return ns.getValue(keys.slice(1).join("."), this, ...userArgs);
      }
    } else {
      // Try default namespace
      if (this.defaultNamespace) {
        return this.getNamespace(this.defaultNamespace)?.getValue(key, this, ...userArgs);
      }
    }
    return undefined;
  }
}
