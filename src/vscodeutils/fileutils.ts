import log from "../logger/log";
import * as path from "path";

import { formatPath, writeFile as fsUtilWriteFile } from "../prompthelpers/fileutils";

import { replace as vsCodeReplace } from "./vscodefunctions";
import { append as vsCodeAppend } from "./vscodefunctions";


export function writeFile({ filePath, content, answer }: { filePath: string, content: string, answer: string }): void {
  filePath = formatPath(filePath);
  log.info(`writeFile: ${filePath}`);
  content = content || answer + "\n";

  fsUtilWriteFile(filePath, content)
  .then((filePath) => {
    log.log(`File "${filePath}" has been written successfully.`);
  })
  .catch((error) => {
    log.error("An error occurred while writing the file:", error);
  });
}

export function replace({ textToReplace,  answer }: { textToReplace: string, answer: string }): void {
 textToReplace = textToReplace || answer + "\n";
  try {
    vsCodeReplace(textToReplace);
  } catch (error) {
    log.error(`Error "${error}"`);
  }
}

export function append({ textToAppend, position = "end", answer }: { textToAppend: string, position: string, answer: string }): void {
  // log.info(`append: ${textToAppend} ${position} ${answer}`);
  textToAppend = textToAppend || answer + "\n";
  try {
    vsCodeAppend(textToAppend, position);
  } catch (error) {
    log.error(error);
  }
}
