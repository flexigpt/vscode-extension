import * as vscode from "vscode";
import * as path from "path";
import * as cp from "child_process";
import log from "../logger/log";

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

export function getActiveLine(): string | undefined {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showInformationMessage("No editor is active");
    return;
  }

  const document: vscode.TextDocument = editor.document;
  const selection: vscode.Selection = editor.selection;
  const activeLine: vscode.TextLine = document.lineAt(selection.active.line);

  return activeLine.text;
}

export async function runCommandInShell(
  cliCommand: string
): Promise<[string, string, number]> {
  return new Promise((resolve, reject) => {
    // Get the workspace directory
    let workspaceDir = getWorkspaceRoot() as string;

    // Spawn a child process to run the command
    const commandProcess = cp.spawn(cliCommand, {
      shell: true,
      cwd: workspaceDir,
    });

    let stdoutChunks: Buffer[] = [];

    // Register handler for command output (stdout)
    // log.info(` CWD: ${workspaceDir}; Command: ${cliCommand}\n`);

    commandProcess.stdout.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk);
      // log.log(`${chunk.toString()}`);
    });

    // Register handler for command errors (stderr)
    commandProcess.stderr.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk); // Redirect stderr to stdout
      // log.log(`${chunk.toString()}`);
    });

    // Register handler for command completion
    commandProcess.on("close", (code: number) => {
      let outstring = Buffer.concat(stdoutChunks).toString();
      // Always resolve, regardless of exit code
      resolve([workspaceDir, outstring, code]);
    });

    // Register handler for any errors thrown by the child process
    commandProcess.on("error", (error: Error) => {
      reject(error); // Reject promise if an error is thrown in the extension code
    });
  });
}
