import log from "../logger/log";

import {
  formatPath,
  readFile as fsUtilReadFile,
} from "../prompthelpers/fileutils";

import {
  openFileOrUnsavedDocument,
  replace as vsCodeReplace,
} from "./vscodefunctions";
import { append as vsCodeAppend } from "./vscodefunctions";

/**
 * A wrapper function that reads a file and logs the operation's result.
 *
 * @param filePath The string path of the file to read.
 * @return A Promise that resolves with the file contents as a string.
 */
export async function readFile({
  filePath,
}: {
  filePath: string;
}): Promise<string> {
  log.info(`readFile: ${filePath}`);

  try {
    const content = await fsUtilReadFile(filePath);
    log.info(`File "${filePath}" has been read successfully.`);
    return content;
  } catch (error) {
    log.error("An error occurred while reading the file:", error);
    // Re-throw the error to allow calling functions to handle it as well
    throw error;
  }
}

export function writeFile({
  filePath,
  content,
  answer,
}: {
  filePath: string;
  content: string;
  answer: string;
}): any {
  filePath = formatPath(filePath);
  log.info(`writeFile: ${filePath}`);
  content = content || answer + "\n";

  openFileOrUnsavedDocument(filePath, content)
    .then(() => {
      log.log(`File "${filePath}" has been written successfully.`);
      return filePath;
    })
    .catch((error) => {
      log.error("An error occurred while writing the file:", error);
      // Re-throw the error to allow calling functions to handle it as well
      throw error;
    });
}

export function replace({
  textToReplace,
  answer,
}: {
  textToReplace: string;
  answer: string;
}): void {
  textToReplace = textToReplace || answer + "\n";
  try {
    vsCodeReplace(textToReplace);
  } catch (error) {
    log.error(`Error "${error}"`);
  }
}

export function append({
  textToAppend,
  position = "end",
  answer,
}: {
  textToAppend: string;
  position: string;
  answer: string;
}): void {
  // log.info(`append: ${textToAppend} ${position} ${answer}`);
  textToAppend = textToAppend || answer + "\n";
  try {
    vsCodeAppend(textToAppend, position);
  } catch (error) {
    log.error(error);
  }
}
