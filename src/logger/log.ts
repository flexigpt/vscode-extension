import * as vscode from "vscode";

let outputChannel: vscode.OutputChannel;

export function setOutputChannel(channel: vscode.OutputChannel) {
  outputChannel = channel;
}

function formatMessage(...args: unknown[]): string {
  return args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
    )
    .join(" ");
}

function writeToChannel(prefix: string, message: string): void {
  if (outputChannel) {
    outputChannel.appendLine(`[${prefix}]: ${message}`);
  } else {
    console.log(`[${prefix}]: ${message}`);
  }
}

const log = {
  log: (...args: unknown[]) => {
    writeToChannel("", formatMessage(...args));
  },
  error: (...args: unknown[]) => {
    const message = formatMessage(...args);
    if (outputChannel) {
      outputChannel.appendLine(`[Error]: ${message}`);
    } else {
      console.error(`[Error]: ${message}`);
    }
  },
  info: (...args: unknown[]) => {
    writeToChannel("Info", formatMessage(...args));
  },
};

export default log;
