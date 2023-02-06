
module.exports = {
    commands: [
        {
            name: "FlexiGPT: Refactor selection",
            template: `Rectify and refactor given {system.language} code.
            code:
            {system.selection}`,
            handler: 'replace',
            description: "Refactor the selected code",
        },
        {
            name: "FlexiGPT: Generate unit test",
            template: `Create unit test for following function. 
            code:
            {system.selection}`,
            handler: {
                func: 'writeFile',
                args: {
                    filePath: 'user.testFileName'
                }
            },
            description: "Generate unit tests for the selected code",
        },
        {
            name: "FlexiGPT: Complete",
            template: `Complete following {system.language} function. Just give code
            code:
            {system.selection}`,
            handler:{
                func: 'append',
                args: {
                    position: 'end'
                }
            },
            description: "Complete the function",
        },
        {
            name: "FlexiGPT: Explain code",
            template: `Explain following code. And show me what can be improved.
            code:
            {system.selection}`,
            handler: {
                func: 'append',
                args: {
                    position: 'user.start'
                }
            },
            description: "Explain the code",
        },
        {
            name: "FlexiGPT: Generate Documentation",
            template: `Write docstring for the following code.
            code:
            {system.selection}`,
            handler: {
                func: 'append',
                args: {
                    position: 'user.start'
                }
            },
            description: "Generate documentation for the selected code",
        },
        {
            name: "FlexiGPT: Find problems",
            template: `Find problems with the following code, fix them and explain what was wrong (Do not change anything else).
            code:
            {system.selection}`,
            handler: {
                func: 'append',
                args: {
                    position: 'user.start'
                }
            },
            description: "Find problems in the selected code",
        },
        {
            name: "FlexiGPT: Optimize selection",
            template: `Optimize the following code.
            code:
            {system.selection}`,
            handler: {
                func: 'append',
                args: {
                    position: 'user.start'
                }
            },
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