import * as path from "path";
import * as vscode from "vscode";
import { expect } from "chai";
import { getCommitAndTagList } from "./../../prompthelpers/gitutils";
import { describe, it, before, after } from "mocha";
import log from "../../logger/log";

describe("getCommitAndTagList function", () => {
  let rootPath = path.join(__dirname, "..", "..", "..");
  //   let editor: vscode.TextEditor;

  //   before(async function () {
  //     rootPath = path.join(__dirname, "..", "..", "..");
  //     await vscode.commands.executeCommand(
  //       "vscode.openFolder",
  //       vscode.Uri.file(rootPath)
  //     );
  //     editor = await vscode.window.showTextDocument(
  //       vscode.Uri.file(path.join(rootPath, "README.md"))
  //     );
  //   });

  //   after(async function () {
  //     await vscode.commands.executeCommand("workbench.action.closeFolder");
  //   });

  it("should return an array of Commits when given no arguments", () => {
    const result = getCommitAndTagList(undefined, undefined, rootPath);
    expect(result.commits).to.be.an("array");
    expect(result.tags).to.be.an("array");
    result.commits.forEach((item) => {
      expect(item).to.have.property("sha");
      expect(item).to.have.property("message");
    });
    log.info(`Result: ${JSON.stringify(result)}`);
  });

  it("should return an array of Commits when given one commit or tag argument", () => {
    const result = getCommitAndTagList(
      "298d12a0c9f98be77813e8dfcb5b37e8f3e1c712",
      undefined,
      rootPath
    );
    expect(result.commits).to.be.an("array");
    expect(result.tags).to.be.an("array");
    result.commits.forEach((item) => {
      expect(item).to.have.property("sha");
      expect(item).to.have.property("message");
    });
    log.info(`Result: ${JSON.stringify(result)}`);
  });

  it("should return an array of Commits and Tags when given two commit or tag arguments", () => {
    const result = getCommitAndTagList(
      "3b2b64d714f0bd3e226f391270e8ee4e13e56fee",
      "2c8d07204b58f9ae5121bef4c6ed4f2718c65ce5",
      rootPath
    );
    expect(result.commits).to.be.an("array");
    expect(result.tags).to.be.an("array");
    result.commits.forEach((item) => {
      expect(item).to.have.property("sha");
      expect(item).to.have.property("message");
    });
    result.tags.forEach((item) => {
      expect(item).to.have.any.keys("name", "message");
    });
    log.info(`Result: ${JSON.stringify(result)}`);
  });

  it("should return an array of Commits with a length of maxCommits when given a maxCommits argument", () => {
    const result = getCommitAndTagList(undefined, undefined, rootPath, 3);
    expect(result.commits).to.be.an("array").with.lengthOf(3);
    expect(result.tags).to.be.an("array");
    result.commits.forEach((item) => {
      expect(item).to.have.property("sha");
      expect(item).to.have.property("message");
    });
    log.info(`Result: ${JSON.stringify(result)}`);
  });

  it("should return an array of Commits with a length of maxCommits when given a maxCommits argument and only destination", () => {
    const result = getCommitAndTagList(
      undefined,
      "db4bd5103ccb7c1ce02579dff84ca27eeffca9c3",
      rootPath,
      20
    );
    // expect(result.commits).to.be.an("array").with.lengthOf(10);
    expect(result.tags).to.be.an("array");
    result.commits.forEach((item) => {
      expect(item).to.have.property("sha");
      expect(item).to.have.property("message");
    });
    log.info(`Result: ${JSON.stringify(result, null, 2)}`);
  });
});
