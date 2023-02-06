import * as path from "path";

import { promises as fs } from "fs";

import log from "../logger/log";

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

export const isHttpAddress = (urlString: string): boolean => {
  try {
    return urlString.toLowerCase().startsWith("http");
  } catch (e) {
    return false;
  }
};

export function getFileNameAndExtension(filePath: string) {
  const pathInfo = path.parse(filePath);
  return {
    extension: pathInfo.ext,
    fileName: pathInfo.name,
    fileFolder: pathInfo.dir,
  };
}

export function getValueWithKey(key: string, variables: any) {
  try {
    const keys = key.split(".");
    let value = variables;
    for (const k of keys) {
      value = value[k];
    }
    return value ?? key;
  } catch {
    return key;
  }
}

export function createFunctionFromString(fnString: string): {
  name: string;
  fn: Function;
} | null {
  try {
    const match = fnString.match(/function\s+(\w+)\(([^)]*)\)\s*\{([\s\S]*)\}/);
    if (!match) {
      throw new Error(
        `The string "${fnString}" doesn't match the expected format of a function.`
      );
    }
    const name = match[1];
    const args = match[2].split(",").map((arg) => arg.trim());
    const body = match[3];
    const fn = new Function(...args, body);
    return { name, fn };
  } catch (error) {
    log.error(error);
    return null;
  }
}
