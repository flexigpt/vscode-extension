export const GENERATOR_LINE_MATCH = "// @ai";

export const MESSAGES = Object.freeze({
  working: "[working, please wait...]",
  noGeneratorLine: `You did not write down any '${GENERATOR_LINE_MATCH}' comment lines`,
  noSelection: "You did not select any code",
});
