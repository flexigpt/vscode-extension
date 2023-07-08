import * as path from "path";
import * as fs from "fs";
import log from "../logger/log";

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
  isAppend: boolean = false
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