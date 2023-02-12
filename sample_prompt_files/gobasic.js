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
            template: `
            Go language\n
            Generate one data point covering zero value and error expectation,
            one data point covering MAX value,
            one data point covering MIN value,
            one data point covering non-zero value, string max 32 bytes, for calling a function.\n
            Use the generated data to write table driven tests using {user.unitTestFramework} go framework,
            that have all return values present in expected results. \n
            code:\n
            {system.selection}\n
            func Test`,

            handler: {
                func: 'writeFile',
                args: {
                    filePath: 'user.testFileName'
                }
            },
            description: "Generate unit tests for the selected code",
            requestparams: {
                model: "code-davinci-002",
                stop: ["##", "func Test", "package main", "func main"],
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