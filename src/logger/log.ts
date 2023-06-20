import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel;

export function setOutputChannel(channel: vscode.OutputChannel) {
    outputChannel = channel;
}

const log = {
    log: (...args: any[]) => {
        const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(' ');
        outputChannel.appendLine(`[Log]: ${message}`);
    },
    error: (...args: any[]) => {
        const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(' ');
        outputChannel.appendLine(`[Error]: ${message}`);
    },
    info: (...args: any[]) => {
        const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(' ');
        outputChannel.appendLine(`[Info]: ${message}`);
    }
};

export default log;