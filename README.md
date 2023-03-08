# FlexiGPT

Interact with GPT AI models (GPT3, ChatGPT, etc) as a power user.

FlexiGPT offers pre-defined prompts enriched with custom or predefined functions that can be engineered and fine-tuned to meet specific user needs. Prompts can be saved and used directly within VSCode, and the extension supports request parameter modifications for GPT APIs and post-processing response via responseHandlers in prompts.

Users can use a chat activity bar interface for request/response interaction, load/save conversations from history, export conversations to a file, and copy/insert/create new files out of GPT response.

FlexiGPT also offers a variety of UI and access features, including keyboard shortcuts, editor/command context, and command palette controls, making it easy to use and customizable.

Download from: [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=ppipada.flexigpt)

## Table of contents <!-- omit from toc -->

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Prompt file format](#prompt-file-format)
  - [Samples](#samples)
  - [Here is a sample javascript (.js) prompt file](#here-is-a-sample-javascript-js-prompt-file)
  - [Here is a more complex javascript (.js) prompt file](#here-is-a-more-complex-javascript-js-prompt-file)
  - [Creating Command](#creating-command)
    - [Predefined System Variables](#predefined-system-variables)
    - [Predefined System Function](#predefined-system-function)
  - [Creating Variables](#creating-variables)
  - [Creating Functions](#creating-functions)
- [License](#license)
- [Contributions](#contributions)
- [Support](#support)

## Features

- Ask GPT AI models (GPT3, ChatGPT, etc) anything you want

  - Currently supported:
    - OpenAI chat completion APIs, with GPT3.5 models
    - OpenAI completion APIs, with GPT2/3 models

- Use pre-defined prompts in configuration files

  - Engineer and fine tune prompts, save them and use them directly within VSCode.
  - Prompts can be enriched using predefined functions or custom functions. Multiple inbuilt [predefined functions](#predefined-system-function) available.
  - Supports request parameter modifications for GPT APIs
  - Supports post-processing response via responseHandlers in prompts.
  - Available inbuilt prompts:

    - [FlexiGPT basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/flexigptbasic.js)

      - Refactor selection
      - Generate unit test
      - Complete
      - Explain code
      - Generate Documentation
      - Find problems
      - Optimize selection

    - [Go basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gobasic.js)
      - Write godoc string
      - Generate unit test

- UI and access

  - Chat activity bar interface for request/response interaction
  - Load/Save conversations from history
  - Export conversations to a file
  - Copy, Insert, Create new file out of GPT response.
  - Detailed request and response to/from to GPT APIs available in activity bar itself for better prompt engineering and debugging
  - Keyboard shortcuts, editor/command context (right click in editor), command palette controls for quick access

- Immediate term TODO:

  - Additional features:
    - Support other models like: [Cohere](https://cohere.ai/), [AI21](https://docs.ai21.com/)
  - Prompt files:
    - Add support for Pre processing the prompt before sending the API.
  - Provide enriched data handling functions. E.g:
    - Collect definitions, strip them and pass on, etc.
    - Diff collection from a git branch for review

## Installation

- Requirements
  - Visual Studio Code v1.74.0 or later
- Steps:
  1. Install Visual Studio Code 1.74.0 or later
  2. Launch Visual Studio Code
  3. From the command palette `Ctrl`-`Shift`-`P` (Windows, Linux) or `Cmd`-`Shift`-`P` (macOS), run `> Extensions: Install Extension`.
  4. Choose the extension `FlexiGPT` by `ppipada`.
  5. Restart Visual Studio Code after the installation

## Configuration

FlexiGPT requires an OpenAI API key to function. You can obtain one from your openAI account settings [here](https://beta.openai.com/account/api-keys).

To configure FlexiGPT, open Visual Studio Code's settings (File > Preferences > Settings or by using the `Ctrl`/`Cmd` + `,` keyboard shortcut) and search for `flexigpt`.

FlexiGPT uses defaultChatCompletionModel: `gpt-3.5-turbo`, unless the prompt overrides it.

Options:

- flexigpt.openai.apiKey: Your OpenAI API key, which can be obtained from the OpenAI website.
- flexigpt.openai.timeout: The timeout for OpenAI requests, in seconds. Default: 60.
- flexigpt.openai.defaultChatCompletionModel: Default model to use for chat completion requests.
  - You can always override the default model per prompt via the prompt file command declaration.
  - FlexiGPT basic prompts will use the default models set.
  - Default: `gpt-3.5-turbo`. Note that `gpt-3.5-turbo` usage is accounted in OpenAIs billing. Only free model that is in beta as of Feb 2023 is codex (`code-davinci-002`).
- flexigpt.openai.defaultCompletionModel: Default model to use for completion requests.
- flexigpt.openai.defaultEditModel: Default model to use for edit requests. (currently unsupported)
  - You can always override the default model per prompt via the prompt file command declaration.
  - FlexiGPT basic prompts will use the default models set.
  - Default: `code-davinci-edit-001`.
- flexigpt.promptFiles: A semicolon-separated list of paths to user-defined prompt configuration files. Prompt file configuration is detailed [below](#prompt-file-format).
- flexigpt.inBuiltPrompts: A semicolon-separated list of inbuilt prompt filenames to enable. For multiple names separate with ';'. 'flexigptbasic.js' will always be enabled. Inbuilt prompts can be found at [this path](https://github.com/ppipada/vscode-flexigpt/tree/main/media/prompts). Current values are: "flexigptbasic.js" and "gobasic.js".
- Sample Full configuration

  ```text
  "flexigpt.openai.apiKey": "sk-mkey",
  "flexigpt.openai.timeout": "120",
  "flexigpt.openai.defaultCompletionModel": "gpt-3.5-turbo",
  "flexigpt.openai.defaultChatCompletionModel": "gpt-3.5-turbo",
  "flexigpt.openai.defaultEditModel": "code-davinci-edit-001",
  "flexigpt.promptFiles": "/home/me/my_prompt_files/myprompts.js",
  "flexigpt.inBuiltPrompts": "gobasic.js"
  ```

## Usage

- Activation/Invocation of FlexiGPT:

  - To ask GPT AI models (GPT3, ChatGPT, etc) anything you want, use the `FlexiGPT: Ask` command from the Command Palette (`Ctrl`/`Cmd` + `Shift` + `P`) or by using the `Ctrl` + `Alt` + `G` keyboard shortcut.
  - This should open the FlexiGPT activity bar with an input text box.
  - On clicking on the input text box, [basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/flexigptbasic.js) provided by FlexiGPT itself, any prompts defined in `flexigpt.promptFiles`, and any inbuilt prompts enabled using `flexigpt.inBuiltPrompts`, as defined in the configuration should be loaded. (If first time click on text box doesn't load some preconfigured prompts, try escaping options and clicking again. VSCode may take some time to load dynamic lists from files.)

- Ask something

  - If you select the preconfigured prompts the question template defined in the prompt command will be used after substituting defined system/user variables. Other command options will also be taken from the definition itself.
  - If you type a free floating question in the text box, the text itself will be used as prompt directly.
  - [Predefined system variables](#predefined-system-variables) can be used to enhance your question.
    - E.g: you can use `{system.selection}` to pass on the selected text in the editor (code or otherwise).
    - Note that the `system.` prefix for a system variable is optional. Therefore, you can even use only `{selection}` to use the selected text, or `{language}` instead of `{system.language}` for language of your file.

- To view your prompt history, open the FlexiGPT activity bar.

## Prompt file format

### Samples

- [FlexiGPT basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/flexigptbasic.js)
- [Go basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gobasic.js)

### Here is a sample javascript (.js) prompt file

```js
module.exports = {
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

### Here is a more complex javascript (.js) prompt file

```js
module.exports = {
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
    // you could also write your own responseHandler
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
        `${baseFolder}\\${fileName}_test.${fileExtension}`,
    },
  ],
};
```

### Creating Command

- name: Required

  - Name of command, can be whatever you want

- template: Required

  - prompt template to use for create GPT model requests (OpenAI, etc). Use can use system or user defined variable in template. variables will replaced with proper value while preparing request
  - To use system variable add `{system.*variableName*}`, variableName can be one of [Predefined System Variables](#predefined-system-variables)
  - To use user variable add `{user.*variableName*}`, variableName must be in variables field in prompt file.

- requestparams: optional
  - This is an object of type `{ [key: string]: any }`.
  - Any params relevant to the GPT provider API can be overridden.
  - Valid params for OpenAI completion request can be found in this [API reference](https://platform.openai.com/docs/api-reference/completions).
- responseHandler: Optional

  - responseHandler is used to handle a response. By default, replace function is used. Handle function can be one of [Predefined System Function](#predefined-system-function) or a User defined function.
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

#### Predefined System Variables

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

#### Predefined System Function

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

### Creating Variables

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

### Creating Functions

TODO

## License

FlexiGPT is open source software licensed under the [MIT license](https://github.com/ppiapda/vscode-flexigpt/blob/master/LICENSE).

## Contributions

Contributions are welcome! Feel free to submit a pull request on GitHub.

## Support

If you have any questions or problems, please open an issue on GitHub at the [issues](https://github.com/ppiapda/vscode-flexigpt/issues) page.
