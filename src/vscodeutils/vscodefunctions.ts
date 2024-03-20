import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as fsPromises from 'fs/promises';
import log from '../logger/log';

export function replace(newValue: string) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    editor.edit(editBuilder => {
      editBuilder.replace(selection, newValue);
    });
  }
}

export function getSelectedText(): string {
  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && activeEditor.document.uri.scheme !== 'file') {
    const editors = vscode.window.visibleTextEditors;
    for (const ed of editors) {
      if (ed.document.uri.scheme === 'file') {
        activeEditor = ed;
        break;
      }
    }
  }
  if (activeEditor) {
    const document = activeEditor.document;
    const selection = activeEditor.selection;
    const selectedText = document.getText(selection);
    return selectedText;
  }
  return '';
}

export function getBaseFolder(): string {
  if (vscode.workspace.workspaceFolders !== undefined) {
    const workspaceFolder = vscode.workspace.workspaceFolders[0]?.uri.fsPath;
    return workspaceFolder || '';
  }
  return '';
}

export function getActiveDocument(): vscode.TextDocument | undefined {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && activeEditor.document.uri.scheme === 'file') {
    return activeEditor.document;
  }

  const editors = vscode.window.visibleTextEditors;
  for (const editor of editors) {
    if (editor.document.uri.scheme === 'file') {
      return editor.document;
    }
  }

  return undefined;
}

export function getActiveDocumentLanguageID(): string {
  const doc = getActiveDocument();
  if (doc) {
    return doc.languageId;
  }
  return '';
}

export function getActiveDocumentFilePath(): string {
  const doc = getActiveDocument();
  if (doc) {
    return doc.fileName;
  }
  return '';
}

export function getActiveDocumentExtension(): string {
  const fname = getActiveDocument()?.fileName;
  if (fname) {
    const pathInfo = path.parse(fname);
    return pathInfo.ext;
  }
  return '';
}

export function getActiveDocumentFileFolder(): string {
  const fname = getActiveDocument()?.fileName;
  if (fname) {
    const pathInfo = path.parse(fname);
    return pathInfo.dir;
  }
  return '';
}

export function getActiveFileName(): string | undefined {
  const fname = getActiveDocument()?.fileName;
  if (fname) {
    const pathInfo = path.parse(fname);
    return pathInfo.name;
  }
}

export function getWorkspaceRoot(): string | undefined {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    throw new Error('No open editors.');
  }

  const rootPath = vscode.workspace.getWorkspaceFolder(
    activeEditor.document.uri
  )?.uri.fsPath;
  if (!rootPath) {
    throw new Error('No workspace folder open.');
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
      position === 'end' ? editor.selection.end : editor.selection.start;

    editor.edit(editBuilder => {
      editBuilder.insert(insert, newValue);
    });
  }
}

export async function openFileOrUnsavedDocument(
  filePath: string,
  inputContent: string
) {
  const directoryPath = path.dirname(filePath);

  try {
    // Check if directory exists
    await fsPromises.access(directoryPath);
  } catch (err) {
    // If directory does not exist, create it
    await fsPromises.mkdir(directoryPath, { recursive: true });
  }

  try {
    // Check if the file exists and you have permission to read it
    await fsPromises.access(filePath, fsPromises.constants.F_OK);
  } catch (err) {
    // eslint-disable-next-line no-undef
    const errorCode = (err as NodeJS.ErrnoException).code;
    if (errorCode === 'ENOENT') {
      // If the file does not exist, create an empty file
      await fsPromises.writeFile(filePath, '');
    } else {
      // If the error is something other than "file not found", re-throw it.
      throw err;
    }
  }

  const doc = await vscode.workspace.openTextDocument(filePath);
  const editor = await vscode.window.showTextDocument(doc);
  const start = new vscode.Position(doc.lineCount + 1, 0);

  // Append content at end
  editor.edit(editBuilder => {
    editBuilder.insert(start, inputContent);
  });
}

export function getActiveLine(): string | undefined {
  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && activeEditor.document.uri.scheme !== 'file') {
    const editors = vscode.window.visibleTextEditors;
    for (const ed of editors) {
      if (ed.document.uri.scheme === 'file') {
        activeEditor = ed;
        break;
      }
    }
  }
  if (!activeEditor) {
    vscode.window.showInformationMessage('No editor is active');
    return;
  }

  const document = activeEditor.document;
  const selection = activeEditor.selection;
  const activeLine = document.lineAt(selection.active.line);

  return activeLine.text;
}

export async function runCommandInShell(
  cliCommand: string
): Promise<[string, string, number]> {
  return new Promise((resolve, reject) => {
    // Get the workspace directory
    const workspaceDir = getWorkspaceRoot() as string;

    // Spawn a child process to run the command
    const commandProcess = cp.spawn(cliCommand, {
      shell: true,
      cwd: workspaceDir
    });

    const stdoutChunks: Buffer[] = [];

    // Register handler for command output (stdout)
    // log.info(` CWD: ${workspaceDir}; Command: ${cliCommand}\n`);

    commandProcess.stdout.on('data', (chunk: Buffer) => {
      stdoutChunks.push(chunk);
      // log.log(`${chunk.toString()}`);
    });

    // Register handler for command errors (stderr)
    commandProcess.stderr.on('data', (chunk: Buffer) => {
      stdoutChunks.push(chunk); // Redirect stderr to stdout
      // log.log(`${chunk.toString()}`);
    });

    // Register handler for command completion
    commandProcess.on('close', (code: number) => {
      const outstring = Buffer.concat(stdoutChunks).toString();
      // Always resolve, regardless of exit code
      resolve([workspaceDir, outstring, code]);
    });

    // Register handler for any errors thrown by the child process
    commandProcess.on('error', (error: Error) => {
      reject(error); // Reject promise if an error is thrown in the extension code
    });
  });
}

export function readOpenFileOrPath(
  varcontext?: any,
  filePath?: string
): string {
  try {
    if (!filePath) {
      filePath = getActiveDocumentFilePath();
      if (!filePath) {
        throw new Error(
          'No file is currently open, and no file path was provided.'
        );
      }
    }
    if (filePath.startsWith('~')) {
      filePath = filePath.replace('~', os.homedir());
    }
    log.info(`Reading file ${filePath}`);
    // Use fsPromises.readFileSync to read the file synchronously
    const content = fs.readFileSync(filePath, 'utf-8');

    // log.info(`File "${filePath}" has been read successfully.`);
    return content;
  } catch (error) {
    log.error(
      `An error occurred while reading the file: ${JSON.stringify(error)}`
    );
    // Re-throw the error to allow calling functions to handle it as well
    throw error;
  }
}
