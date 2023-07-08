import * as vscode from "vscode";
import * as path from "path";

export function replace(newValue: string) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    editor.edit((editBuilder) => {
      editBuilder.replace(selection, newValue);
    });
  }
}

export function getSelectedText(): string {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const selection = editor.selection;
    const selectedText = document.getText(selection);
    return selectedText;
  }
  return "";
}

export function getBaseFolder(): string {
  if (vscode.workspace.workspaceFolders !== undefined) {
    const workspaceFolder = vscode.workspace.workspaceFolders[0]?.uri.fsPath;
    return workspaceFolder || "";
  }
  return "";
}

export function getActiveDocument(): vscode.TextDocument | undefined {
  return vscode.window.activeTextEditor?.document;
}

export function getActiveDocumentLanguageID(): string {
  return getActiveDocument()?.languageId as string;
}

export function getActiveDocumentFilePath(): string {
  return getActiveDocument()?.fileName as string;
}

export function getActiveDocumentExtension(): string {
  let fname = getActiveDocument()?.fileName as string;
  const pathInfo = path.parse(fname);
  return pathInfo.ext;
}

export function getActiveDocumentFileFolder(): string {
  let fname = getActiveDocument()?.fileName as string;
  const pathInfo = path.parse(fname);
  return pathInfo.dir;
}

export function getActiveFileName(): string | undefined {
  let fname = getActiveDocument()?.fileName as string;
  const pathInfo = path.parse(fname);
  return pathInfo.name;
}

export function getWorkspaceRoot(): string | undefined {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    throw new Error("No open editors.");
  }

  const rootPath = vscode.workspace.getWorkspaceFolder(
    activeEditor.document.uri
  )?.uri.fsPath;
  if (!rootPath) {
    throw new Error("No workspace folder open.");
  }
  // log.info(`Got rootpath: ${rootPath}`);
  // const gitPath = path.join(rootPath, ".git");
  // const isGitRepository = vscode.workspace.workspaceFolders?.some(
  //   (workspaceFolder) => workspaceFolder.uri.fsPath === gitPath
  // );
  // if (!isGitRepository) {
  //   throw new Error("The workspace folder is not a Git repository.");
  // }
  return rootPath;
}

export function append(newValue: string, position: string) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const insert =
      position === "end" ? editor.selection.end : editor.selection.start;

    editor.edit((editBuilder) => {
      editBuilder.insert(insert, newValue);
    });
  }
}


