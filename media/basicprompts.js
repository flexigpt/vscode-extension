
module.exports = {
    commands: [
        {
            name: "FlexiGPT: Refactor selection",
            template: `Rectify and refactor given {system.language} code.
            code:
            {system.selection}`,
            description: "Refactor the selected code",
        },
        {
            name: "FlexiGPT: Generate unit test",
            template: `Create unit test for following function. 
            code:
            {system.selection}`,
            description: "Generate unit tests for the selected code",
        },
        {
            name: "FlexiGPT: Complete",
            template: `Complete following {system.language} function. Just give code
            code:
            {system.selection}`,
            description: "Complete the function",
        },
        {
            name: "FlexiGPT: Explain code",
            template: `Explain following code.
            code:
            {system.selection}`,
            description: "Explain the code",
        },
        {
            name: "FlexiGPT: Add Documentation",
            template: `Write docstring for the following code.
            code:
            {system.selection}`,
            responseHandler: {
                func: 'append',
                args: {
                    position: 'user.start'
                }
            },
            description: "Generate documentation for the selected code and append",
        },
        {
            name: "FlexiGPT: Find problems",
            template: `Find problems with the following code, fix them and explain what was wrong (Do not change anything else).
            code:
            {system.selection}`,
            description: "Find problems in the selected code",
        },
        {
            name: "FlexiGPT: Optimize selection",
            template: `Optimize the following code.
            code:
            {system.selection}`,
            description: "Optimize the selected code",
        },
    ],
    functions: [
        {
        }
    ],
    variables: [
        {
            name: "start",
            value: "start"
        },
        {
            name: "end",
            value: "end"
        },
        {
            name: "testFileName",
            value: ({ baseFolder,fileName,fileExtension }) => `${baseFolder}\\${fileName}_test.${fileExtension}`
        },
    ]
};