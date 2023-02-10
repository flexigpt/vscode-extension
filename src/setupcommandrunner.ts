import * as vscode from "vscode";

import { systemVariableNames } from "./vscodeutils/predefinedvariables";
import {
  getActiveDocument,
  getBaseFolder,
  getSelectedText,
} from "./vscodeutils/vscodefunctions";

import { getFileNameAndExtension } from "./promptimporter/promptutils";

import { Variable } from "./promptimporter/promptvariables";
import {
  getCommandRunnerContext,
  Command,
  CommandRunnerContext,
} from "./promptimporter/promptcommands";

export function setupCommandRunnerContext(
  context: vscode.ExtensionContext
): CommandRunnerContext {
  let commandRunnerContext = getCommandRunnerContext();
  initDocumentContext(commandRunnerContext);
  initEvents(commandRunnerContext);
  return commandRunnerContext;
}

function initDocumentContext(commandRunnerContext: CommandRunnerContext) {
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
}

function initEvents(commandRunnerContext: CommandRunnerContext) {
  vscode.window.onDidChangeActiveTextEditor((e) => {
    if (!e) {
      return;
    }
    commandRunnerContext.setSystemVariable(
      new Variable(systemVariableNames.language, e.document.languageId)
    );
    commandRunnerContext.setSystemVariable(
      new Variable(systemVariableNames.filePath, e.document.fileName)
    );
    const { extension, fileName, fileFolder } = getFileNameAndExtension(
      e.document.fileName
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
