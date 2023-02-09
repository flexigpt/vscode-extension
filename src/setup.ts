import * as vscode from "vscode";
import axios from "axios";
import log from "./logger/log";

import Provider, { CompletionRequest, EditRequest } from "./strategy/strategy";
import OpenAIAPIStrategy, {
  getDefaultCompletionCommand,
} from "./strategy/openaiapi";

import { systemVariableNames } from "./vscodeutils/predefinedvariables";
import {
  getActiveDocument,
  getBaseFolder,
} from "./vscodeutils/vscodefunctions";

import {
  fileExists,
  isHttpAddress,
  getFileNameAndExtension,
} from "./promptimporter/promptutils";

import { FunctionWrapper } from "./promptimporter/promptfunctions";
import { Variable } from "./promptimporter/promptvariables";
import {
  getCommandRunnerContext,
  Command,
  CommandRunnerContext,
} from "./promptimporter/promptcommands";

export async function getOpenAIProvider(): Promise<Provider> {
  const config = vscode.workspace.getConfiguration("flexigpt");
  const apiKey = (config.get("openai.apiKey") as string) || "";
  const timeout = (config.get("timeout") as BigInt) || 60;

  if (apiKey) {
    return new Provider(new OpenAIAPIStrategy(apiKey, timeout));
  }

  throw new Error("You must set an `apiKey` for OpenAI APIs");
}

export function setupCommandRunnerContext(
  context: vscode.ExtensionContext
): CommandRunnerContext {
  const commandRunnerContext = getCommandRunnerContext();
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.baseFolder, getBaseFolder())
  );
  const document = getActiveDocument();
  if (document) {
    commandRunnerContext.setSystemVariable(
      new Variable(systemVariableNames.language, document.languageId)
    );
    commandRunnerContext.setSystemVariable(
      new Variable(systemVariableNames.filePath, document.fileName)
    );
    const { extension, fileName, fileFolder } = getFileNameAndExtension(
      document.fileName
    );
    commandRunnerContext.setSystemVariable(
      new Variable(systemVariableNames.fileName, fileName)
    );
    commandRunnerContext.setSystemVariable(
      new Variable(systemVariableNames.fileExtension, extension)
    );
    commandRunnerContext.setSystemVariable(
      new Variable(systemVariableNames.fileFolder, fileFolder)
    );
  }

  return commandRunnerContext;
}

export function importPrompts(
  promptFiles: string,
  commandRunnerContext: CommandRunnerContext
) {
  async function read(fileOrUrl: string) {
    let dataRead = "";
    if (isHttpAddress(fileOrUrl)) {
      await readFromUrl(fileOrUrl)
        .then((data) => {
          dataRead = data;
        })
        .then(undefined, (err) => {
          log.error(`Error in readurl ${err}`);
        })
        .catch((error) => {
          log.error(error);
        });
    } else {
      await readFile(fileOrUrl)
        .then((data) => {
          dataRead = data;
          // log.info(dataRead);
        })
        .then(undefined, (err) => {
          log.error(`Error in readfile ${err}`);
        })
        .catch((error) => {
          log.error(error);
        });
    }
    return dataRead;
  }

  async function readFromUrl(url: string): Promise<string> {
    const response = await axios.get(url);
    return response.data;
  }

  async function readFile(filePath: string) {
    const buffer = await vscode.workspace.fs.readFile(
      vscode.Uri.file(filePath)
    );
    return buffer.toString();
  }

  function processFileContents(userDefinitions: any) {
    if (userDefinitions?.commands) {
      userDefinitions.commands.forEach(
        (command: { name: any; template: any; handler: any }) => {
          commandRunnerContext.addCommand(
            new Command(command.name, command.template, command.handler)
          );
        }
      );
    }
    if (userDefinitions?.variables) {
      userDefinitions.variables.forEach(
        (variable: { name: any; value: any }) => {
          commandRunnerContext.setUserVariable(
            new Variable(variable.name, variable.value)
          );
        }
      );
    }

    if (userDefinitions?.functions) {
      userDefinitions.functions.forEach((fn: Function) => {
        commandRunnerContext.setFunction(FunctionWrapper.fromFunction(fn));
      });
    }
  }

  function importJsPromptFile(promptFile: string) {
    read(promptFile)
      .then((data) => {
        let userDefinitions = eval(data);
        processFileContents(userDefinitions);
        // log.info(data);
      })
      .then(undefined, (err) => {
        log.error(`Error in readfile ${err}`);
      })
      .catch((error) => {
        log.error(error);
      });
  }

  function importJsonPromptFile(promptFile: string) {
    read(promptFile)
      .then((data) => {
        let userDefinitions = JSON.parse(data);
        processFileContents(userDefinitions);
        // log.info(data);
      })
      .then(undefined, (err) => {
        log.error(`Error in readfile ${err}`);
      })
      .catch((error) => {
        log.error(error);
      });
  }

  function getFileType(promptFile: string): string | undefined {
    if (promptFile) {
      return promptFile.split(".")?.pop()?.toLowerCase();
    }
  }

  function importFile(filePath: string) {
    fileExists(filePath)
      .then((data) => {
        if (!data) {
          log.info(`Couldnt find file "${filePath}". Skipping import`);
          return;
        }
      })
      .catch((error) => {
        log.error(error);
      });

    const fileType = getFileType(filePath);
    if (fileType === "js") {
      importJsPromptFile(filePath);
    } else if (fileType === "json") {
      importJsonPromptFile(filePath);
    }
  }

  function getFilesFromConfig(): Array<string> {
    if (!promptFiles) {
      return [];
    }
    return promptFiles.split(";");
  }

  // const allPromptFiles = getFilesFromConfig().concat(
  //   searchForPromptFilesUnderVsCodeFolder()
  // );

  const allPromptFiles = getFilesFromConfig();

  log.info(allPromptFiles);
  allPromptFiles.forEach((sf) => {
    try {
      importFile(sf);
    } catch (error) {
      log.error(error);
      return;
    }
  });
}

export async function importAllPrompts(
  extensionUri: vscode.Uri,
  commandRunnerContext: CommandRunnerContext
) {
  const config = vscode.workspace.getConfiguration("flexigpt");
  const promptFiles = config.get("promptFiles") as string | "";

  const basicpromptsURI = vscode.Uri.joinPath(
    extensionUri,
    "media",
    "basicprompts.js"
  );
  if (basicpromptsURI.fsPath) {
    importPrompts(basicpromptsURI.fsPath, commandRunnerContext);
  }

  if (promptFiles) {
    importPrompts(promptFiles, commandRunnerContext);
  }

  // const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  // // Sleeps for 2 seconds.
  // await sleep(2000);
  // let allc = commandRunnerContext.getCommands();
  // log.info(`Commands: ${allc}`);
}

export async function getCodeString(
  commandRunnerContext: CommandRunnerContext,
  apiProvider: Promise<Provider> | undefined,
  text: string
) {
  if (apiProvider === undefined) {
    return;
  }
  const question = commandRunnerContext.prepareAndSetCommand(text);
  let response: string;
  try {
    // Send the search prompt to the ChatGPTAPI instance and store the response
    var crequest = getDefaultCompletionCommand(question);
    response = (await (await apiProvider).completion(crequest)) as string | "";
  } catch (e) {
    log.error(e);
    response = `[ERROR] ${e}`;
  }
  if (!response) {
    throw Error("Could not get response from Provider.");
  }
  return `# Generated code for ${text}`;
}
