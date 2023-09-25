import * as assert from "assert";
import { suite, test } from "mocha";


// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { setOutputChannel } from "../../logger/log";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");
  const outputChannel = vscode.window.createOutputChannel('My Test Output Channel');
  outputChannel.show(true);
  setOutputChannel(outputChannel);

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});
