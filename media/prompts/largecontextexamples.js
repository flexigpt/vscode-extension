module.exports = {
    commands: [
        {
            name: "Anthropic: Write Go workflow test with swagger",
            template: `Write workflow tests in golang using the following swagger.
            swagger:
            {system.selection}`,
            responseHandler: {
                func: 'writeFile',
                args: {
                    filePath: 'user.testFileName'
                }
            },
            description: "Generate workflow tests for the selected swagger",
            requestparams: {
                model: "claude-1-100k"
            },
        },
        {
            name: "Anthropic: Find bugs and races",
            template: `Find bugs or race conditions in the below code. List them in priority order. give your reasons for choosing priority. give code after rectifying the top priority item:
            {system.selection}`,
            description: "Find bugs",
            requestparams: {
                model: "claude-1-100k"
            },
        },
        {
            name: "OpenAI: Find bugs and races",
            template: `Find bugs or race conditions in the below code. List them in priority order. give your reasons for choosing priority. give code after rectifying the top priority item:
            {system.selection}`,
            description: "Find bugs",
            requestparams: {
                model: "gpt-3.5-turbo-16k",
            },
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