import * as vscode from "vscode";
import axios from "axios";
import log from "./logger/log";

import { fileExists, isHttpAddress } from "./promptimporter/promptutils";
import { FunctionWrapper } from "./promptimporter/promptfunctions";
import { Variable } from "./promptimporter/promptvariables";
import {
  Command,
  CommandRunnerContext,
  DEFAULT_COMMAND_HANDLER,
} from "./promptimporter/promptcommands";

export function importPrompts(
  promptFiles: string,
  commandRunnerContext: CommandRunnerContext
) {
  function read(fileOrUrl: string) {
    let dataRead = "";
    return new Promise((resolve, reject) => {
      if (isHttpAddress(fileOrUrl)) {
        axios
          .get(fileOrUrl)
          .then((response) => {
            dataRead = response.data;
            resolve(dataRead);
          })
          .catch((error) => {
            log.error(`Error in read: ${error}`);
            reject(error);
          });
      } else {
        vscode.workspace.fs
          .readFile(vscode.Uri.file(fileOrUrl))
          .then((buffer) => {
            dataRead = buffer.toString();
            resolve(dataRead);
          })
          .then(undefined, (err) => {
            log.error(`Error in read: ${err}`);
            reject(err);
          });
      }
    });
  }

  function processFileContents(userDefinitions: any) {
    if (userDefinitions?.commands) {
      userDefinitions.commands.forEach(
        (command: {
          name: any;
          template: any;
          handler: any;
          description: any;
          requestparams: any;
        }) => {
          let addc = new Command(
            command.name,
            command.template,
            command.handler,
            command.description,
          );
          if (command.description as string) {
            addc.description = command.description;
          } else {
            addc.description = command.name;
          }
          if (command.handler) {
            addc.handler = command.handler;
          } else {
            addc.handler = DEFAULT_COMMAND_HANDLER;
          }
          if (command.requestparams as { [key: string]: any; }) {
            addc.requestparams = command.requestparams;
          } 
          commandRunnerContext.addCommand(addc);
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
        let c = data as string;
        let userDefinitions = eval(c);
        processFileContents(userDefinitions);
      })
      .then(undefined, (err) => {
        log.error(`Error in readfile ${err}`);
      })
      .catch((error) => {
        log.error(`Caught error in readFile ${error}`);
      });
  }

  function importJsonPromptFile(promptFile: string) {
    read(promptFile)
      .then((data) => {
        let c = data as string;
        let userDefinitions = JSON.parse(c);
        processFileContents(userDefinitions);
        // log.info(data);
      })
      .then(undefined, (err) => {
        log.error(`Error in readfile ${err}`);
      })
      .catch((error) => {
        log.error(`Caught error in readFile ${error}`);
      });
  }

  function getFileType(promptFile: string): string | undefined {
    if (promptFile) {
      return promptFile.split(".")?.pop()?.toLowerCase();
    }
  }

  function importFile(filePath: string) {
    if (filePath === "") {
      log.info("Empty file prompt. skipping.");
      return;
    }
    fileExists(filePath)
      .then((data) => {
        if (!data) {
          log.info(`Couldn't find file "${filePath}". Skipping import`);
        } else {
          const fileType = getFileType(filePath);
          if (fileType === "js") {
            importJsPromptFile(filePath);
          } else if (fileType === "json") {
            importJsonPromptFile(filePath);
          }
        }
      })
      .catch((error) => {
        log.error(error);
      });
  }

  function splitPromptFiles(): Array<string> {
    if (!promptFiles) {
      return [];
    }
    return promptFiles.split(";");
  }

  const allPromptFiles = splitPromptFiles();

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

export function importAllPrompts(
  extensionUri: vscode.Uri,
  commandRunnerContext: CommandRunnerContext
) {
  const config = vscode.workspace.getConfiguration("flexigpt");
  let promptFiles = config.get("promptFiles") as string | "";

  const basicpromptsURI = vscode.Uri.joinPath(
    extensionUri,
    "media",
    "basicprompts.js"
  );
  if (basicpromptsURI.fsPath) {
    if (promptFiles === "") {
      promptFiles = basicpromptsURI.fsPath;
    } else {
      promptFiles = basicpromptsURI.fsPath + ";" + promptFiles;
    }
  }

  if (promptFiles) {
    importPrompts(promptFiles, commandRunnerContext);
  }

  let allc = commandRunnerContext
    .getCommands()
    .map((item) => item.name)
    .join(", ");
  log.info(`Commands: ${allc}`);
}
