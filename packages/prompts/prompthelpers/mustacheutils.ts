import * as mustache from "mustache";
import * as fs from "fs";
import { log } from "@/logger/log";

type Renderer = (template: string) => string;

export function convertSnakeToCamel(
  snakeStr: string,
  render: Renderer
): string {
  const renderedStr = render(snakeStr);
  if (typeof renderedStr !== "string") {
    log.error("Error rendering string");
    return "";
  }

  return renderedStr
    .split("_")
    .map((word, index) => {
      if (word.length === 0) {
        return "";
      }

      let modifiedWord = word.toLowerCase();

      if (index !== 0) {
        modifiedWord = modifiedWord[0].toUpperCase() + modifiedWord.slice(1);
      }

      if (["id", "Id", "iD"].includes(modifiedWord)) {
        modifiedWord = "ID";
      }

      return modifiedWord;
    })
    .join("");
}

export function convertToUpperCase(text: string, render: Renderer): string {
  const renderedText = render(text);

  if (typeof renderedText !== "string") {
    log.error("Error rendering text");
    return "";
  }

  return renderedText.toUpperCase();
}

function changeFirstLetterCase(
  text: string,
  render: Renderer,
  toUpperCase: boolean
): string {
  const renderedText = render(text);
  if (typeof renderedText !== "string" || renderedText.length === 0) {
    log.error("Error rendering text");
    return "";
  }

  const firstChar = toUpperCase
    ? renderedText.charAt(0).toUpperCase()
    : renderedText.charAt(0).toLowerCase();
  const restOfString = renderedText.slice(1);

  return firstChar + restOfString;
}

export function firstToLower(text: string, render: Renderer): string {
  return changeFirstLetterCase(text, render, false);
}

export function firstToUpper(text: string, render: Renderer): string {
  return changeFirstLetterCase(text, render, true);
}

// Function to render a Mustache template with given data
export function renderMustacheTemplate(
  template: string,
  data: object
): string | null {
  if (typeof template !== "string" || typeof data !== "object") {
    log.error(
      "Invalid input: template should be a string and data should be an object"
    );
    return null;
  }

  try {
    return mustache.render(template, data);
  } catch (error) {
    log.error("Error rendering Mustache template:", error);
    return null;
  }
}

// Wrapper function to read template and data from files and render
export function renderTemplateFromFile(
  templateFilePath: string,
  dataFilePath: string
): string | null {
  let template: string;
  let dataRaw: string;

  // Read template from file
  try {
    template = fs.readFileSync(templateFilePath, "utf8");
  } catch (error) {
    log.error("Error reading template file:", error);
    return null;
  }

  // Read data from file and parse as JSON
  try {
    dataRaw = fs.readFileSync(dataFilePath, "utf8");
  } catch (error) {
    log.error("Error reading data file:", error);
    return null;
  }

  let data: object;
  try {
    data = JSON.parse(dataRaw);
  } catch (error) {
    log.error("Error parsing JSON data:", error);
    return null;
  }

  // Render the template using the data
  return renderMustacheTemplate(template, data);
}
