import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

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
  const currentlyOpenTabfilePath: string = getActiveDocument()
    ?.fileName as string;
  const currentlyOpenTabfileName = path.basename(currentlyOpenTabfilePath);
  return currentlyOpenTabfileName;
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

export function writeFile(
  filePath: string,
  fileContent: string,
  isAppend: boolean = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    fs.writeFile(
      filePath,
      fileContent,
      { flag: isAppend ? "a" : "w" },
      (writeFileError) => {
        if (writeFileError) {
          reject(writeFileError);
          return;
        }
        resolve(filePath);
      }
    );
  });
}
