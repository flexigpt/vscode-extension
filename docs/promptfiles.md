## Sample prompt files in repo

- [FlexiGPT basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/flexigptbasic.js)
- [Go basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gobasic.js)
- [Go sqlx + squirrel prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gosql.js)

## Simple javascript prompt file

```js
module.exports = {
  namespace: "myprompts",
  commands: [
    {
      name: "Refactor",
      template: `Refactor following function.
            function:
            {system.selection}`,
    },
  ],
};
```

## Complex javascript prompt file

```js
module.exports = {
  namespace: "MyComplexPrompts",
  commands: [
    {
      name: "Create unit test.",
      template: `Create unit test in {user.unitTestFramework} framework for following function.
            code:
            {system.selection}`,
      responseHandler: {
        func: "writeFile",
        args: {
          filePath: "user.testFileName",
        },
      },
      requestparams: {
        model: "gpt-3.5-turbo",
        stop: ["##", "func Test", "package main", "func main"],
      },
    },
    {
      name: "Write godoc",
      template: `Write godoc for following functions.
            code:
            {system.selection}`,
      responseHandler: {
        func: "append",
        args: {
          position: "start",
        },
      },
      requestparams: {
        model: "code-davinci-002",
        stop: ["##", "func Test", "package main", "func main"],
      },
    },
  ],
  functions: [
    // you could also write your own responseHandler.
    // Note that it takes a single object as input.
    function myHandler({ system, user }) {
      console.table({ system });
      console.table({ user });
    },
  ],
  variables: [
    {
      name: "unitTestFramework",
      value: "testing",
    },
    {
      name: "testFileName",
      value: ({ baseFolder, fileName, fileExtension }) =>
        `${baseFolder}\\${fileName}_test${fileExtension}`,
    },
  ],
  cliCommands: [
    {
      name: "Go generate all",
      command: `go generate ./...`,
      description: "Run go generate in the workspace",
    },
  ],
};
```

## Creating Command

- name: Required

  - Name of command, can be whatever you want

- description: Optional

  - Description of command, can be whatever you want

- template: Required

  - prompt template to use for create GPT model requests (OpenAI, etc). You can use system or user defined variable in template. variables will replaced with proper value while preparing request
  - To use system variable add `{system.*variableName*}`, variableName can be one of [Predefined System Variables](#predefined-system-variables). You can also pass parameters to functions like readFile. E.g: `{readfile user.testFile}` is a valid template variable where input to readfile is the file pointed by the user defined variable testfile.
  - To use user variable add `{user.*variableName*}`, variableName must be in variables field in prompt file.

- requestparams: optional

  - This is an object of type `{ [key: string]: any }`.
  - requestparams["provider"]: For setting a provider from non defaultProvider config
  - Any params relevant to the GPT provider API can be overridden.
  - Valid params for OpenAI completion request can be found in this [API reference](https://platform.openai.com/docs/api-reference/completions).

- responseHandler: Optional

  - responseHandler is used to handle a response. By default, replace function is used. Handle function can be one of [Predefined System Function](#predefined-system-functions) or a User defined function.
  - You can set responseHandler in following ways:

    - Just function name. function run with default values

    ```js
    responseHandler: "replace";
    ```

    - With args function name to set function args

    ```js
    responseHandler: {
        func: 'replace',
        args: {
        textToReplace: 'user.answerModified'
        }
    }
    ```

## Creating Variables

Any of the `variables` items can be used in a command template. User-defined values must have the "user" prefix. For example, if "testFileName" is defined in variables, it can be used as "user.TestFileName" in the template file or passed to a function.

Variable values can be static or dynamic. For dynamic values, you should create a getter method. When calling the variable getter, a single object with system variables (see Predefined System Variables) is passed as first argument, any other vars can be taken as next args..

```js
module.exports = {
variables: [
    {
        //static
        name: "testingFramework",
        value: "xUnit"
    },
    {
        //dynamic
        name: "typeNameInResponse",
        value: ({ answer/*system variable*/ }, myTestFile/*user defined var*/ ) => {}
    },
]
functions: [
  function extractTypeName({ code, system }) {/**/},
  function myOtherFunc() {},
],
commands: [
    {
        name: "Create DTO",
        template: `Create unit test with {user.testingFramework} for following class.
        class:
        {system.selection}`,
        responseHandler: {
            func: 'writeFile',
            args: {
                filePath: 'user.typeNameInResponse'/*usage for function arg*/
            }
        }
    }
]
}
```

### Predefined System Variables

All vars are case-insensitive.

| Variable Name           | Description                                                                    |
| ----------------------- | ------------------------------------------------------------------------------ |
| system.selection        | Selected text in editor                                                        |
| system.question         | OpenAI question                                                                |
| system.answer           | OpenAI answer                                                                  |
| system.language         | Programming language of active file                                            |
| system.baseFolder       | Project base path                                                              |
| system.fileFolder       | Parent folder path of active file                                              |
| system.fileName         | Name of active file                                                            |
| system.filePath         | Full path of active file                                                       |
| system.fileExtension    | Extension of active file                                                       |
| system.commitAndTagList | Last 25 commits and associated tags                                            |
| system.readFile         | Read the full open editor file. Optionaly pass a filepath as a second argument |

Note that the `system.` prefix for a system variable is optional. Therefore, you can even use only `{selection}` to use the selected text, or `{language}` instead of `{system.language}` for language of your file.

## Creating Functions

- Write a simple javascript function which takes exactly one object as input.
- Add that function to the `functions` list.
- Use in response handler as needed

### Predefined System Functions

| Function Name | Description                                | params(default)                            |
| ------------- | ------------------------------------------ | ------------------------------------------ |
| append        | Append Text                                | textToAppend(system.answer),postion('end') |
| replace       | Replace selected text                      | textToReplace(system.answer)               |
| writeFile     | Write text to file. Append if file exists. | filePath(),content(system.answer)          |

- Replace

  - Replace text with selection. Take optional parameter `textToReplace` In default value equals to API answer.
  - Default Usage

    ```js
        ...
        commands: [
            {
                name: "Refactor",
                template: `Refactor following function.
                function:
                {system.selection}`
                responseHandler:'replace'
            },
        ],
    ```

  - Usage with params

    ```js
        ...
        commands: [
            {
                name: "Refactor",
                template: `Refactor following function.
                function:
                {system.selection}`
                responseHandler:{
                    func: 'replace',
                    args: {
                        textToReplace: 'user.answerModified'
                    }
                }
            },
        ],
        variables: [
            {
                name: "answerModified",
                value: ({answer})=>`/*\n${anwer}\n*/`
            },
        ],
    ```

- Append

  - Append text with selection. Take optional parameter `textToAppend` and `postion`. `postion` can be `start` or `end`
  - In default `textToAppend` equals to OpenAI `postion` is end of selection
  - Sample usage

    ```js
        ...
        commands: [
            {
                name: "Append",
                template: `Write jsdoc for following function.
                function:
                {system.selection}`
                responseHandler:{
                    func: 'append',
                    args: {
                        position: 'start'
                    }
                }
            },
        ],
    ```

## Creating CLI Commands

- name: Required

  - Name of the cli command, can be whatever you want

- description: Optional

  - Description of the cli command, can be whatever you want

- command: Required

  - The cli string that you want to execute.
  - Note that the directory in which the command is executed is the root directory of your workspace.
  - You can use system or user defined variable in the command as described in the features section. Variables will replaced with proper values while preparing request
