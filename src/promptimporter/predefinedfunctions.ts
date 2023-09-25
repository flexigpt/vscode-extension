import { append, readFile, replace, writeFile } from "../vscodeutils/responseHandlerFunctions";
import { FunctionWrapper } from "../promptdef/promptfunctions";

export const preDefinedFunctions = [
    new FunctionWrapper("append", append),
    new FunctionWrapper("replace", replace),
    new FunctionWrapper("writeFile", writeFile),
    new FunctionWrapper("readFile", readFile),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    new FunctionWrapper("noop", function noop() {}),
  ];