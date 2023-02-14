import log from "../logger/log";

import { writeFile as vsCodeWriteFile } from "./vscodefunctions";
import { replace as vsCodeReplace } from "./vscodefunctions";
import { append as vsCodeAppend } from "./vscodefunctions";

export function writeFile({ filePath, content, system: { answer } }: { filePath: string, content: string, system: { answer: string } }): void {
  content = content || answer + "\n";
  vsCodeWriteFile(filePath, content);
}

export function replace({ textToReplace, system: { answer } }: { textToReplace: string, system: { answer: string } }): void {
 textToReplace = textToReplace || answer + "\n";
  try {
    vsCodeReplace(textToReplace);
  } catch (error) {
    log.error(`Error "${error}"`);
  }
}

export function append({ textToAppend, position = "end", system: { answer } }: { textToAppend: string, position: string, system: { answer: string } }): void {
  textToAppend = textToAppend || answer + "\n";
  try {
    vsCodeAppend(textToAppend, position);
  } catch (error) {
    log.error(error);
  }
}
