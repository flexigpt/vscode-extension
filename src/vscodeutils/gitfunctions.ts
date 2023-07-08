import { getCommitAndTagList } from "../prompthelpers/gitutils";
import { getWorkspaceRoot } from "./vscodefunctions";

export function getCommitAndTagListString(
  commitOrTag1?: string,
  commitOrTag2?: string,
  rootPath?: string,
  maxCommits: number = 25
): string {
  if (!rootPath) {
    rootPath = getWorkspaceRoot();
  }
  return JSON.stringify(
    getCommitAndTagList(commitOrTag1, commitOrTag2, rootPath, maxCommits),
    null,
    2
  );
}
