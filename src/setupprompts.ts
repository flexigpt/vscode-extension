import * as vscode from "vscode";
import log from "./logger/log";

import { FilesImporter } from "./vscodeutils/promptfiles";
import { CommandRunnerContext } from "@/prompts/promptimporter/promptcommandrunner";

export function importAllPrompts(
  extensionUri: vscode.Uri,
  commandRunnerContext: CommandRunnerContext
) {
  const config = vscode.workspace.getConfiguration("flexigpt");
  const promptFiles = config.get("promptFiles") as string | "";
  const inBuiltPrompts = config.get("inBuiltPrompts") as string | "";

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
    const fi = new FilesImporter(commandRunnerContext);
    fi.importPromptFiles(fullPrompts);
  }

  const allc = commandRunnerContext.getAllCommandsAsLabels();
  log.info(`Loaded all commands`);
  // log.info(`Commands: ${JSON.stringify(allc, null, 2)}`);
}
