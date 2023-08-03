module.exports = {
  namespace: "FlexiGPT",
  commands: [
    {
      name: "Refactor selection",
      template: `Rectify and refactor given {system.language} code.
            code:
            {system.selection}`,
      description: "Refactor the selected code",
    },
    {
      name: "Generate unit tests",
      template: `Generate unit tests for the following function according to the constraints provided below. The response must consist of code only, with no additional explanations or context outside of the code itself. Any necessary comments should be included within the code.

      Constraints:
      - Write table-driven tests using {system.language} standard testing packages.
      - Add test cases for: few happy path scenarios, 0 values, min values, max values, non-zero values.
      
      Language: {system.language}
      code:
      {system.selection}
      // Dont even add it in triple quotes. Please respond with the code only, following the constraints above.
      `,
      description: "Generate unit tests for the selected code",
      responseHandler: {
        func: "writeFile",
        args: {
          filePath: "user.testFileName",
        },
      },
    },
    {
      name: "Complete",
      template: `Complete following {system.language} function. Just give code
            code:
            {system.selection}`,
      description: "Complete the function",
    },
    {
      name: "Explain code",
      template: `Explain following code.
            code:
            {system.selection}`,
      description: "Explain the code",
    },
    {
      name: "Generate Documentation",
      template: `Write a docstring for the below code.
            Constraints:
            - Make it concise by providing summary and its purpose only.
            - Dont go into implementation details.
            - Generate in default style of language
            - Language: {system.language}. Example style {system.language}Doc
            code:
            
            {system.selection}`,
      description: "Generate documentation for the selected code",
    },
    {
      name: "Find problems",
      template: `Find problems with the following code, fix them and explain what was wrong (Do not change anything else).
            code:
            {system.selection}`,
      description: "Find problems in the selected code",
    },
    {
      name: "Optimize selection",
      template: `Optimize the following code.
            code:
            {system.selection}`,
      description: "Optimize the selected code",
    },
  ],
  functions: [{}],
  variables: [
    {
      name: "start",
      value: "start",
    },
    {
      name: "end",
      value: "end",
    },
    {
      name: "testFileName",
      value: ({ fileFolder, fileName, fileExtension }) =>
        `${fileFolder}\\${fileName}_test${fileExtension}`,
    },
  ],
};
