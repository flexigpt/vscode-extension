# FlexiGPT

Interact with GPT AI models (GPT3, ChatGPT, etc) as a power user.

FlexiGPT is a Visual Studio Code extension that allows you to interact with GPT AI models (GPT3, ChatGPT, etc) as a power user. It provides an easy-to-use interface for generating and using prompts with these models, as well as customizing the configuration to your needs.

## Features

- Ask GPT AI models (GPT3, ChatGPT, etc) anything you want
- Customize the timeout for OpenAI requests
- User-defined prompt configuration files
- Keyboard shortcuts for quick access

## Requirements

- Visual Studio Code v1.74.0 or later
- Node.js v19.0.0 or later

## Installation

1. Install Visual Studio Code 1.74.0 or later
2. Launch Visual Studio Code
3. From the command palette `Ctrl`-`Shift`-`P` (Windows, Linux) or `Cmd`-`Shift`-`P` (macOS), run `> Extensions: Install Extension`.
4. Choose the extension `FlexiGPT` by `ppipada`.
5. Restart Visual Studio Code after the installation

## Configuration

FlexiGPT requires an OpenAI API key to function. You can obtain one from https://beta.openai.com/account/api-keys

To configure FlexiGPT, open Visual Studio Code's settings (File > Preferences > Settings or by using the `Ctrl`/`Cmd` + `,` keyboard shortcut) and search for `flexigpt`.

Options:

- flexigpt.openai.apiKey: Your OpenAI API key, which can be obtained from the OpenAI website.
- flexigpt.openai.timeout: The timeout for OpenAI requests, in seconds. Default: 60.
- flexigpt.openai.defaultCompletionModel: Default model to use for completion requests.
  - You can always override the default model per prompt via the prompt file command declaration.
  - FlexiGPT basic prompts will use the default models set.
  - Default: text-davinci-003. Note that text-davinci-003 usage is accounted in OpenAIs billing. Only free model that is in beta as of Feb 2023 is codex (code-davinci-002).
- flexigpt.openai.defaultEditModel: Default model to use for edit requests. (currently unsupported)
  - You can always override the default model per prompt via the prompt file command declaration.
  - FlexiGPT basic prompts will use the default models set.
  - Default: code-davinci-edit-001.
- flexigpt.promptFiles: A semicolon-separated list of paths to user-defined prompt configuration files. Prompt file configuration is detailed [below](#prompt-file-format).

## Usage

- To ask GPT AI models (GPT3, ChatGPT, etc) anything you want, use the `FlexiGPT: Ask` command from the Command Palette (`Ctrl`/`Cmd` + `Shift` + `P`) or by using the `Ctrl` + `Alt` + `G` keyboard shortcut.
- This should open the FlexiGPT activity bar with an input text box.
- On clicking on the input text box, [basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/basicprompts.js) provided by FlexiGPT itself and any prompts defined in `flexigpt.promptFiles` as defined in the configuration should be loaded. (If first time click on text box doesn't load some preconfigured prompts, try escaping options and clicking again. VSCode takes some time to load a dynamic list from file.)
- If you select the preconfigured prompts the question template defined in the prompt command will be used after substituting defined system/user variables. Other command options will also be taken from the definition itself.
- If you type a free floating question in the text box, the text itself will be used as prompt directly. Here too, you can use the predefined system variables to enhance your question. E.g: you can use `{system.selection}` to pass on the selected text in the editor (code or otherwise).
- To view your prompt history, open the FlexiGPT activity bar.

## Prompt file format

### Samples

- [FlexiGPT Basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/basicprompts.js)
- [Go basic prompts](https://github.com/ppipada/vscode-flexigpt/tree/main/sample_prompt_files)

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
      handler: {
        func: "writeFile",
        args: {
          filePath: "user.testFileName",
        },
      },
      requestparams: {
        model: "code-davinci-002",
        stop: ["##", "func Test", "package main", "func main"],
      },
    },
    {
      name: "Write godoc",
      template: `Write godoc for following functions.
            code:
            {system.selection}`,
      handler: {
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
    // you could also write your own handler
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

Name

- name: Required

  - Name of command can be whatever you want

- template: Required

  - prompt template to use for create GPT model requests (OpenAI, etc). Use can use system or user defined variable in template. variables will replaced with proper value while preparing request
  - To use system variable add `{system.*variableName*}`, variableName can be one of [Predefined System Variables](#predefined-system-variables)
  - To use user variable add `{user.*variableName*}`, variableName must be in variables field in prompt file.

- requestparams: optional
  - This is an object of type `{ [key: string]: any }`.
  - Any params relevant to the GPT provider API can be overridden.
  - Valid params for OpenAI completion request can be found in this [API reference](https://platform.openai.com/docs/api-reference/completions).
  
- handler: Optional

  - handler is used to handle a response. By default, replace function is used. Handle function can be one of [Predefined System Function](#predefined-system-function) or a User defined function.
  - You can set handler in following ways:

    - Just function name. function run with default values

    ```js
    handler: "replace";
    ```

    - With args function name to set function args

    ```js
    handler: {
        func: 'replace',
        args: {
        textToReplace: 'user.answerModified'
        }
    }
    ```

#### Predefined System Variables

| Variable Name        | Description                         |
| -------------------- | ----------------------------------- |
| system.selection     | Selected text in editor             |
| system.question      | OpenAI question                     |
| system.answer        | OpenAI answer                       |
| system.language      | Programming language of active file |
| system.baseFolder    | Project base path                   |
| system.fileName      | Name of active file                 |
| system.filePath      | Full path of active file            |
| system.fileExtension | Extension of active file            |

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
                handler:'replace'
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
                handler:{
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
                handler:{
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
        handler: {
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

If you have any questions or problems, please open an issue on GitHub at https://github.com/ppiapda/vscode-flexigpt/issues.
