import * as vscode from "vscode";
import log from "../logger/log";

import { FilesImporter } from "./promptfiles";
import { CommandRunnerContext } from "./promptcommandrunner";

export function importAllPrompts(
  extensionUri: vscode.Uri,
  commandRunnerContext: CommandRunnerContext
) {
  const config = vscode.workspace.getConfiguration("flexigpt");
  let promptFiles = config.get("promptFiles") as string | "";
  let inBuiltPrompts = config.get("inBuiltPrompts") as string | "";

  let inBuiltPromptNames = "flexigptbasic.js";
  if (inBuiltPrompts) {
    inBuiltPromptNames = inBuiltPromptNames + ";" + inBuiltPrompts;
  }
  const basePath = vscode.Uri.joinPath(extensionUri, "media", "prompts").fsPath;

  const parray = inBuiltPromptNames.split(";");
  const fullPromptsArray = parray.map((f) => `${basePath}/${f}`);
  let fullPrompts = fullPromptsArray.join(";");

  if (promptFiles) {
    fullPrompts = fullPrompts + ";" + promptFiles;
  }
  if (fullPrompts) {
    let fi = new FilesImporter(commandRunnerContext);
    fi.importPromptFiles(fullPrompts);
  }

  let allc = commandRunnerContext
    .getCommands()
    .map((item) => item.name)
    .join(", ");
  log.info(`Commands: ${allc}`);
}
