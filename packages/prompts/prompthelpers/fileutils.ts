import * as path from "path";
import * as fs from "fs";
import { log } from "@/logger/log";

export function formatPath(filePath: string): string {
  return filePath.split("\\").join(path.sep);
}

export function getFileNameAndExtension(filePath: string) {
  const pathInfo = path.parse(filePath);
  return {
    extension: pathInfo.ext,
    fileName: pathInfo.name,
    fileFolder: pathInfo.dir,
  };
}

export function writeFile(
  filePath: string,
  fileContent: string,
  isAppend = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    fs.writeFile(
      filePath,
      fileContent,
      { flag: isAppend ? "a" : "w" },
      (writeFileError) => {
        if (writeFileError) {
          log.error(writeFileError);
          reject(writeFileError);
          return;
        }
        resolve(filePath);
      }
    );
  });
}

/**
 * Asynchronously reads the entire contents of a file.
 *
 * @param path The string path of the file to read.
 * @return A Promise that resolves with the file contents as a string.
 * @throws Will throw an error if the file cannot be read (e.g., if it does not exist or there is a permissions issue).
 */
export async function readFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Attempt to read the file
        fs.readFile(path, 'utf8', (error, data) => {
            if (error) {
                // If an error occurred, reject the Promise with a new Error object
                reject(new Error(`Failed to read file at path "${path}": ${error.message}`));
            } else {
                // If successful, resolve the Promise with the file contents
                resolve(data);
            }
        });
    });
}
