import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import log from "../logger/log";

interface Commit {
  sha: string;
  message: string;
}

interface Tag {
  name: string;
  message?: string;
}

export function getGitRootPath(): string | undefined {
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

function splitShaAndRest(str: string): [string, string] {
  const firstSpaceIndex = str.indexOf(' ');
  if (firstSpaceIndex === -1) {
    // If there's no space in the string, return the whole string as the first field
    return [str, ''];
  }
  const firstField = str.substring(0, firstSpaceIndex);
  const secondField = str.substring(firstSpaceIndex + 1);
  return [firstField.trim(), secondField.trim()];
}

function splitTagsInfoAndMessage(line: string): [string, string] {
  const regex = /^(.*?)\((.*?)\)(.*)$/;
  const match = line.match(regex);
  if (match) {
    const [_, firstPart, secondPart] = match;
    return [firstPart.trim(), secondPart.trim()];
  } else {
    // If there's no match, treat the whole line as the first part and an empty string as the second part
    return [line.trim(), ''];
  }
}

function getGitLogs(
  rootPath: string,
  start: string,
  end: string,
  maxCommits: number = 100
): { sha: string; message: string; tags: string }[] {
  const gitLogCommand = `git log --pretty=oneline ${start}..${end} --decorate=full --decorate-refs-exclude=refs/tags/ --no-notes --date-order ${
    maxCommits ? `--max-count=${maxCommits}` : ""
  }`;
  const gitOutput = cp.execSync(gitLogCommand, { cwd: rootPath });
  const commitList = gitOutput
    .toString()
    .split("\n")
    .map((line: string) => {
      const [sha, fullmessage] = splitShaAndRest(line);
      const [message, tags] = splitTagsInfoAndMessage(fullmessage);
      return { sha, message, tags};
    });
  return commitList;
}

export function getCommitAndTagList(
  commitOrTag1?: string,
  commitOrTag2?: string,
  rootPath?: string,
  maxCommits: number = 25
): {commits: Commit[], tags: Tag[]} {
  if (!rootPath) {
    rootPath = getGitRootPath();
  }
  if (!rootPath) {
    log.info(
      `Did not find a git root directory for ${vscode.window.activeTextEditor?.document.uri}`
    );
    return {commits: [], tags: []};
  }

  let startSha = "";
  let endSha = "";

  if (commitOrTag1) {
    startSha = cp
      .execSync(`git rev-parse ${commitOrTag1}`, { cwd: rootPath })
      .toString()
      .trim();
  } else {
    startSha = cp
      .execSync(`git log --reverse --pretty=%H | head -1`, { cwd: rootPath })
      .toString()
      .trim();
  }

  if (commitOrTag2) {
    endSha = cp
      .execSync(`git rev-parse ${commitOrTag2}`, { cwd: rootPath })
      .toString()
      .trim();
  } else {
    endSha = "HEAD";
  }

  let commitList: {commits: Commit[], tags: Tag[]} = {
    commits: [], tags: []
  };
  const logsout = getGitLogs(rootPath, startSha, endSha, maxCommits);

  for (const commit of logsout) {
    commitList.commits.push({ sha: commit.sha, message: commit.message });
    // git log --tags --simplify-by-decoration --pretty="format:%d %H %s %ad" --date=short | grep -Eo "\(tag: ([^,]+)"
    const tagOutput = cp
      .execSync(`git tag -n1 --points-at ${commit.sha}`, { cwd: rootPath })
      .toString()
      .trim();
    if (tagOutput) {
      const [tag, message] = splitShaAndRest(tagOutput);
      commitList.tags.push({ name: tag, message: message });
    }

    if (maxCommits && commitList.commits.length >= maxCommits) {
      break;
    }
  }

  return commitList;
}

export function getCommitAndTagListString(
  commitOrTag1?: string,
  commitOrTag2?: string,
  rootPath?: string,
  maxCommits: number = 25
): string {
  return JSON.stringify(getCommitAndTagList(commitOrTag1, commitOrTag2, rootPath, maxCommits), null, 2);
}