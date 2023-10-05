import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import {
  Variable,
  VariableContext,
  VariableNamespaces,
} from "prompts/promptdef/promptvariables";
import {
  getBaseFolder,
  getSelectedText,
  getActiveDocumentExtension,
  getActiveDocumentFileFolder,
  getActiveDocumentFilePath,
  getActiveDocumentLanguageID,
  getActiveFileName,
} from "../../vscodeutils/vscodefunctions";
import log from "../../logger/log";

describe("Variable", () => {
  describe("#constructor()", () => {
    it("should throw error for non-string or empty name", () => {
      expect(() => new Variable("", "value")).to.throw(Error);
      expect(() => new Variable(null as any, "value")).to.throw(Error);
    });

    it("should create variable for valid input", () => {
      expect(() => new Variable("test", "value")).to.not.throw(Error);
    });
  });

  describe("#getValue()", () => {
    it("should return static value if not a function", () => {
      const variable = new Variable("test", "staticValue");
      expect(variable.getVarValue()).to.equal("staticValue");
    });

    it("should return value from function if value is a function", () => {
      const variable = new Variable("test", () => "functionValue");
      expect(variable.getVarValue()).to.equal("functionValue");
    });


    it("should return undefined on error and log error", () => {
      const variable = new Variable("test", () => {
        throw new Error("Test Error");
      });
      expect(variable.getVarValue()).to.be.undefined;
    });
  });
});

describe("VariableNamespaces", () => {
  describe("#setDefaultNamespace()", () => {
    it("should throw error for non-string or empty namespace", () => {
      const context = new VariableNamespaces();
      context.addNamespace("test");
      expect(() => context.setDefaultNamespace("")).to.throw(Error);
      expect(() => context.setDefaultNamespace(null as any)).to.throw(Error);
    });

    it("should throw error for nonexistent namespace", () => {
      const context = new VariableNamespaces();
      expect(() => context.setDefaultNamespace("nonexistent")).to.throw(Error);
    });

    it("should set default namespace if it exists", () => {
      const context = new VariableNamespaces();
      context.addNamespace("test");
      expect(() => context.setDefaultNamespace("test")).to.not.throw(Error);
    });
  });

  describe("#addNamespace()", () => {
    it("should throw error for non-string or empty namespace", () => {
      const context = new VariableNamespaces();
      expect(() => context.addNamespace("")).to.throw(Error);
      expect(() => context.addNamespace(null as any)).to.throw(Error);
    });

    it("should add a namespace successfully", () => {
      const context = new VariableNamespaces();
      expect(() => context.addNamespace("test")).to.not.throw(Error);
    });
  });

  describe("#getNamespace()", () => {
    it("should return undefined for nonexistent namespace", () => {
      const context = new VariableNamespaces();
      expect(context.getNamespace("nonexistent")).to.be.undefined;
    });

    it("should return namespace if it exists", () => {
      const context = new VariableNamespaces();
      context.addNamespace("test");
      expect(context.getNamespace("test")).to.be.instanceOf(VariableContext);
    });
  });

  describe("#getValue()", () => {
    it("should return undefined for non-string or empty key", () => {
      const context = new VariableNamespaces();
      expect(context.getValue("")).to.be.undefined;
      expect(context.getValue(null as any)).to.be.undefined;
    });


    it("should return value from default namespace", () => {
      const context = new VariableNamespaces();
      const namespace = "test";
      context.addNamespace(namespace);
      context.setDefaultNamespace(namespace);
      const ns = context.getNamespace(namespace);
      if (!ns) {
        return;
      }
      ns.addVariable(new Variable("x", 20));
      expect(context.getValue("x")).to.equal(20);
    });

    it("should return undefined for invalid key in default namespace", () => {
      const context = new VariableNamespaces();
      const namespace = "test";
      context.addNamespace(namespace);
      context.setDefaultNamespace(namespace);
      expect(context.getValue("y")).to.be.undefined;
    });
  });
});

describe("VariableContext", () => {
  describe("#addVariable()", () => {
    it("should throw error for invalid variable", () => {
      const context = new VariableContext();
      expect(() => context.addVariable(null as any)).to.throw(Error);
    });

    it("should add a valid variable", () => {
      const context = new VariableContext();
      expect(() => context.addVariable(new Variable("x", 10))).to.not.throw(
        Error
      );
    });
  });

});

describe("VariableNamespacesExampleUsage", () => {
  let variablesCollection: VariableNamespaces;

  beforeEach(() => {
    variablesCollection = new VariableNamespaces();
    variablesCollection.addNamespace("system");
    variablesCollection
      .getNamespace("system")
      ?.addVariable(new Variable("id", 123));
    variablesCollection.setDefaultNamespace("system");
    variablesCollection
      .getNamespace("system")
      ?.addVariable(new Variable("firstname", "John"));
      variablesCollection
      .getNamespace("system")
      ?.addVariable(new Variable("lastname", "Doe"));
      variablesCollection
      .getNamespace("system")
      ?.addVariable(
      new Variable(
        "fullname",
        ({ firstname, lastname }: { firstname: any; lastname: any }) =>
          `${firstname} ${lastname}`
      )
    );
    variablesCollection.addNamespace("user");
    variablesCollection
      .getNamespace("user")
      ?.addVariable(new Variable("id", 123));
  });

  it("should retrieve primitive variables from default namespace", () => {
    expect(variablesCollection.getValue("firstname")).to.equal("John");
    expect(variablesCollection.getValue("lastname")).to.equal("Doe");
  });

  it("should retrieve variable with getter function", () => {
    expect(variablesCollection.getValue("fullname")).to.equal("John Doe");
  });

  it("should retrieve variable from namespace", () => {
    expect(variablesCollection.getValue("user.id")).to.equal(123);
  });

  it("should return undefined for non-existing variable", () => {
    expect(variablesCollection.getValue("nonexistent")).to.be.undefined;
  });

  it("should throw error for invalid variable name", () => {
    expect(() => new Variable("", "value")).to.throw(
      Error,
      "Variable name must be a non-empty string"
    );
  });

  it("should throw error for invalid namespace name", () => {
    expect(() => variablesCollection.addNamespace("")).to.throw(
      Error,
      "Namespace name must be a non-empty string"
    );
  });
});

describe("VariableContextSystemUsage", () => {
  let variablesCollection: VariableNamespaces;

  beforeEach(() => {
    variablesCollection = new VariableNamespaces();
    variablesCollection.addNamespace("system");
    variablesCollection.addNamespace("user");

    variablesCollection
      .getNamespace("system")
      ?.addVariable(new Variable("basefolder", getBaseFolder));
    variablesCollection
      .getNamespace("system")
      ?.addVariable(new Variable("file", "filenametest.ts"));
    variablesCollection
      .getNamespace("user")
      ?.addVariable(
        new Variable(
          "testfile",
          ({ basefolder, file }: { basefolder: any; file: any }) =>
            `${basefolder}/${file}`
        )
      );
    variablesCollection.setDefaultNamespace("system");
  });


  it("should retrieve variable from namespace", () => {
    expect(variablesCollection.getValue("system.file")).to.equal("filenametest.ts");
  });

  it("should retrieve variable with getter function", () => {
    const bf = getBaseFolder();
    console.info("test base folder: " + bf);
    expect(variablesCollection.getValue("system.basefolder")).to.equal(bf);
  });

  
  it("should retrieve variable from default namespace", () => {
    expect(variablesCollection.getValue("file")).to.equal("filenametest.ts");
  });

  it("should return undefined for non-existing variable", () => {
    expect(variablesCollection.getValue("nonexistent")).to.be.undefined;
  });

  it("should return dependent variable", () => {
    const bf = `${getBaseFolder()}/filenametest.ts`;
    log.info("test file: " + bf);
    expect(variablesCollection.getValue("user.testfile")).to.equal(bf);
  });

  it("should return partial vars iteratively", () => {
    variablesCollection.getNamespace("system")?.addVariable(new Variable("answer", 42));
    expect(variablesCollection.getValue("textToAppend")).to.be.undefined;
    expect(variablesCollection.getValue("position")).to.be.undefined;
    expect(variablesCollection.getValue("answer")).to.equal(42);
  });
});
