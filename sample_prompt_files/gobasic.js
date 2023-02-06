module.exports = {
    commands: [
        {
            name: "Go: Write godoc string",
            template: `Write godoc for following code.
            code:
            {system.selection}`,
            handler: {
                func: 'append',
                args: {
                    position: 'user.start'
                }
            }
        },
        {
            name: "Go: Generate unit test",
            template: `Create unit test in {user.unitTestFramework} framework for following function. 
            Cover a empty values case, a max values case, a min values case.
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
    ],
    functions: [
        {
        }
    ],
    variables: [
        {
            name: "unitTestFramework",
            value: "testing"
        },
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