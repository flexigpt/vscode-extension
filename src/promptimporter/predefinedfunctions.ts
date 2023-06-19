import { append, replace, writeFile } from "../vscodeutils/fileutils";
import { FunctionWrapper } from "../promptdef/promptfunctions";

export const preDefinedFunctions = [
    new FunctionWrapper("append", append),
    new FunctionWrapper("replace", replace),
    new FunctionWrapper("writeFile", writeFile),
    new FunctionWrapper("noop", function noop() {}),
  ];