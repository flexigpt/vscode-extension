import log from "../logger/log";

import { writeFile as vsCodeWriteFile } from "./vscodefunctions";
import { replace as vsCodeReplace } from "./vscodefunctions";
import { append as vsCodeAppend } from "./vscodefunctions";

export function writeFile(
  filePath: string,
  content: string,
  system: { answer: string }
): void {
  content = content || system.answer;
  vsCodeWriteFile(filePath, content);
}

export function replace(
  textToReplace: string,
  system: { answer: string }
): void {
  textToReplace = textToReplace || system.answer;
  try {
    vsCodeReplace(textToReplace);
  } catch (error) {
    log.error(`Error "${error}"`);
  }
}

export function append(
  textToAppend: string,
  position = "end",
  system: { answer: string }
): void {
  textToAppend = textToAppend || system.answer;
  try {
    vsCodeAppend(textToAppend, position);
  } catch (error) {
    log.error(error);
  }
}
