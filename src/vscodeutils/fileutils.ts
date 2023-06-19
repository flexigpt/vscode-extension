import log from "../logger/log";
import * as path from "path";

import { writeFile as vsCodeWriteFile } from "./vscodefunctions";
import { replace as vsCodeReplace } from "./vscodefunctions";
import { append as vsCodeAppend } from "./vscodefunctions";

function formatPath(filePath: string): string {
  return filePath.split('\\').join(path.sep);
}


export function getFileNameAndExtension(filePath: string) {
  const pathInfo = path.parse(filePath);
  return {
    extension: pathInfo.ext,
    fileName: pathInfo.name,
    fileFolder: pathInfo.dir,
  };
}

export function writeFile({ filePath, content, system: { answer } }: { filePath: string, content: string, system: { answer: string } }): void {
  filePath = formatPath(filePath);
  log.info(`writeFile: ${filePath}`);
  content = content || answer + "\n";

  vsCodeWriteFile(filePath, content)
  .then((filePath) => {
    log.log(`File "${filePath}" has been written successfully.`);
  })
  .catch((error) => {
    log.error("An error occurred while writing the file:", error);
  });
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
