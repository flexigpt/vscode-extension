## Prompting

### Features

- Engineer and fine tune prompts, save them and use them directly within VSCode.
- Supports request parameter modifications for GPT APIs
- Prompts can be enriched using predefined functions or custom functions. Multiple inbuilt [predefined functions](#predefined-system-functions) available.
- Supports post-processing response via responseHandlers in prompts. Multiple inbuilt [predefined responseHandlers](#predefined-system-functions) available. Also supports custom responseHandlers. Example can be found [here](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gosql.js).
- Function calling feature of GPT3.5/4 models is also supported. Example can be found in [this prompt file](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gobasic.js).

### UI behavior

- On clicking on the input text box, [basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/flexigptbasic.js) provided by FlexiGPT itself, any prompts defined in `flexigpt.promptFiles`, and any inbuilt prompts enabled using `flexigpt.inBuiltPrompts`, as defined in the configuration should be loaded. (If first time click on text box doesn't load some preconfigured prompts, try escaping options and clicking again. VSCode may take some time to load dynamic lists from files.)

- If you select the preconfigured prompts the question template defined in the prompt command will be used after substituting defined system/user variables. Other command options will also be taken from the definition itself.
- If you type a free floating question in the text box, the text itself will be used as prompt directly.
- [Predefined system variables](/prompts#predefined-system-variables) can be used to enhance your question.

  - E.g: you can use `{system.selection}` to pass on the selected text in the editor (code or otherwise).
  - Note that the `system.` prefix for a system variable is optional. Therefore, you can even use only `{selection}` to use the selected text, or `{language}` instead of `{system.language}` for language of your file.

## Inbuilt prompts

- [FlexiGPT basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/flexigptbasic.js) (Default: enabled)

  - Refactor selection
  - Generate unit test
  - Complete
  - Explain code
  - Generate Documentation
  - Find problems
  - Optimize selection

- [Go basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gobasic.js) (Default: disabled, enable in configuration)

  - Write godoc string
  - Generate unit test

- [Go sqlx + squirrel prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gosql.js) (Default: disabled, enable in configuration)
  - Generate Create, Read, Update, Delete (CRUD) code for a table specified as a struct selection in the editor using sqlx for db operations and squirrel for query building.

## Prompt file format

### Sample files in repo

- [FlexiGPT basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/flexigptbasic.js)
- [Go basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gobasic.js)
- [Go sqlx + squirrel prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gosql.js)

### Simple javascript (.js) prompt file

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

### Complex javascript (.js) prompt file

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
};
```

## Creating Command

- name: Required

  - Name of command, can be whatever you want

- template: Required

  - prompt template to use for create GPT model requests (OpenAI, etc). Use can use system or user defined variable in template. variables will replaced with proper value while preparing request
  - To use system variable add `{system.*variableName*}`, variableName can be one of [Predefined System Variables](#predefined-system-variables)
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

## Predefined System Variables

| Variable Name           | Description                         |
| ----------------------- | ----------------------------------- |
| system.selection        | Selected text in editor             |
| system.question         | OpenAI question                     |
| system.answer           | OpenAI answer                       |
| system.language         | Programming language of active file |
| system.baseFolder       | Project base path                   |
| system.fileName         | Name of active file                 |
| system.filePath         | Full path of active file            |
| system.fileExtension    | Extension of active file            |
| system.commitAndTagList | Last 25 commits and associated tags |

Note that the `system.` prefix for a system variable is optional. Therefore, you can even use only `{selection}` to use the selected text, or `{language}` instead of `{system.language}` for language of your file.

## Predefined System Functions

| Function Name | Description           | params(default)                                   |
| ------------- | --------------------- | ------------------------------------------------- |
| append        | Append Text           | textToAppend(system.answer),postion('end')        |
| replace       | Replace selected text | textToReplace(system.answer)                      |
| showWebView   | Show Webview          | question(system.question),question(system.answer) |
| writeConsole  | Write text to console | content(system.answer)                            |
| writeFile     | Write text to file    | filePath(),content(system.answer)                 |

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

## Creating Variables

Any of the `variables` items can be used in a command template. User-defined values must have the "user" prefix. For example, if "testFileName" is defined in variables, it can be used as "user.TestFileName" in the template file or passed to a function.

Variable values can be static or dynamic. For dynamic values, you should create a getter method. When calling the variable getter, system variables(see Predefined System Variables) and functions are passed as arguments, the first argument is a system variable and the second one is a function.

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
        value: ({ answer/*system variable*/ }, { extractTypeName/*user defined function*/ }) => extractTypeName({ code: answer })
    },
]
functions: [function extractTypeName({ code, system }) {/**/}],
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

## Creating Functions

TODO: Add description
