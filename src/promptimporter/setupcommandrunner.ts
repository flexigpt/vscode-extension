import * as vscode from "vscode";

import { systemVariableNames } from "./predefinedvariables";
import { preDefinedFunctions } from "./predefinedfunctions";

import {
  getBaseFolder,
  getSelectedText,
  getActiveDocumentExtension,
  getActiveDocumentFileFolder,
  getActiveDocumentFilePath,
  getActiveDocumentLanguageID,
  getActiveFileName,
  readOpenFileOrPath,
} from "../vscodeutils/vscodefunctions";

import { Variable } from "../promptdef/promptvariables";
import { CommandRunnerContext } from "./promptcommandrunner";
import { getCommitAndTagListString } from "../vscodeutils/gitfunctions";

export function setupCommandRunnerContext(
  context: vscode.ExtensionContext
): CommandRunnerContext {
  const commandRunnerContext = new CommandRunnerContext();
  initPreDefinedFunctions(commandRunnerContext);
  initDocumentContext(commandRunnerContext);
  initEvents(commandRunnerContext);
  return commandRunnerContext;
}

function initPreDefinedFunctions(commandRunnerContext: CommandRunnerContext) {
  if (preDefinedFunctions) {
    for (const fn of preDefinedFunctions) {
      commandRunnerContext.setSystemFunction(fn);
    }
  }
}

function initDocumentContext(commandRunnerContext: CommandRunnerContext) {
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.baseFolder, getBaseFolder)
  );
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.selection, getSelectedText)
  );
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.language, getActiveDocumentLanguageID)
  );
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.filePath, getActiveDocumentFilePath)
  );
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.fileName, getActiveFileName)
  );
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.fileExtension, getActiveDocumentExtension)
  );
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.fileFolder, getActiveDocumentFileFolder)
  );
  commandRunnerContext.setSystemVariable(
    new Variable(
      systemVariableNames.commitAndTagList,
      getCommitAndTagListString
    )
  );
  commandRunnerContext.setSystemVariable(
    new Variable(
      systemVariableNames.readFile,
      readOpenFileOrPath,
    )
  );
}

function initEvents(commandRunnerContext: CommandRunnerContext) {
  vscode.window.onDidChangeActiveTextEditor((e) => {
    if (!e) {
      return;
    }
  });

  vscode.window.onDidChangeTextEditorSelection(async (e) => {
    // Check if the editor where the event originated is a file editor
    if (!e || e.textEditor.document.uri.scheme !== "file") {
      return;
    }
    const selection = getSelectedText();
    if (!selection) {
      return;
    }
    commandRunnerContext.setSystemVariable(
      new Variable(systemVariableNames.selection, selection)
    );
  });
}
