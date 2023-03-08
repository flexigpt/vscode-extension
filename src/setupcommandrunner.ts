import * as vscode from "vscode";

import { systemVariableNames } from "./vscodeutils/predefinedvariables";
import { preDefinedFunctions } from "./promptimporter/promptfunctions";

import {
  getBaseFolder,
  getSelectedText,
  getActiveDocumentExtension,
  getActiveDocumentFileFolder,
  getActiveDocumentFilePath,
  getActiveDocumentLanguageID,
  getActiveFileName,
} from "./vscodeutils/vscodefunctions";

import { Variable } from "./promptimporter/promptvariables";
import { CommandRunnerContext } from "./promptimporter/promptcommands";
import { getCommitAndTagListString } from "./vscodeutils/gitfunctions";

export function setupCommandRunnerContext(
  context: vscode.ExtensionContext
): CommandRunnerContext {
  let commandRunnerContext = new CommandRunnerContext();
  initPreDefinedFunctions(commandRunnerContext);
  initDocumentContext(commandRunnerContext);
  initEvents(commandRunnerContext);
  return commandRunnerContext;
}

function initPreDefinedFunctions(commandRunnerContext: CommandRunnerContext) {
  if (preDefinedFunctions) {
    for (const fn of preDefinedFunctions) {
      commandRunnerContext.setFunction(fn);
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
    new Variable(
      systemVariableNames.fileExtension,
      getActiveDocumentExtension
    )
  );
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.fileFolder, getActiveDocumentFileFolder)
  );
  commandRunnerContext.setSystemVariable(
    new Variable(systemVariableNames.commitAndTagList, getCommitAndTagListString)
  );
}

function initEvents(commandRunnerContext: CommandRunnerContext) {
  vscode.window.onDidChangeActiveTextEditor((e) => {
    if (!e) {
      return;
    }
    // commandRunnerContext.setSystemVariable(
    //   new Variable(systemVariableNames.language, e.document.languageId)
    // );
    // commandRunnerContext.setSystemVariable(
    //   new Variable(systemVariableNames.filePath, e.document.fileName)
    // );
    // const { extension, fileName, fileFolder } = getFileNameAndExtension(
    //   e.document.fileName
    // );
    // commandRunnerContext.setSystemVariable(
    //   new Variable(systemVariableNames.fileName, fileName)
    // );
    // commandRunnerContext.setSystemVariable(
    //   new Variable(systemVariableNames.fileExtension, extension)
    // );
    // commandRunnerContext.setSystemVariable(
    //   new Variable(systemVariableNames.fileFolder, fileFolder)
    // );
  });

  vscode.window.onDidChangeTextEditorSelection(async (e) => {
    if (!e) {
      return;
    }
    commandRunnerContext.setSystemVariable(
      new Variable(systemVariableNames.selection, getSelectedText())
    );
  });
}
