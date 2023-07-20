## Prompting

### Features

- Engineer and fine tune prompts, save them and use them directly within VSCode.

- Supports request parameter modifications for GPT APIs

- [Predefined system variables](/promptfiles#predefined-system-variables) can be used to enhance your question.
  - E.g: you can use `{system.selection}` to pass on the selected text in the editor (code or otherwise).
  - Note that the `system.` prefix for a system variable is optional. Therefore, you can even use only `{selection}` to use the selected text, or `{language}` instead of `{system.language}` for language of your file.

- Supports post-processing response via responseHandlers in prompts. Multiple inbuilt [predefined responseHandlers](/promptfiles#predefined-system-functions) available. Also supports custom responseHandlers. Example can be found [here](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gosql.js).

- Function calling feature of GPT3.5/4 models is also supported. Example can be found in [this prompt file](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gobasic.js).

### UI behavior

- On clicking on the input text box, [basic prompts](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/flexigptbasic.js) provided by FlexiGPT itself, any prompts defined in `flexigpt.promptFiles`, and any inbuilt prompts enabled using `flexigpt.inBuiltPrompts`, as defined in the configuration should be loaded. (If first time click on text box doesn't load some preconfigured prompts, try escaping options and clicking again. VSCode may take some time to load dynamic lists from files.)

- If you select the preconfigured prompts the question template defined in the prompt command will be used after substituting defined system/user variables. Other command options will also be taken from the definition itself.

- If you type a free floating question in the text box, the text itself will be used as prompt directly. You can use [predefined system variables](/promptfiles#predefined-system-variables) to enhance your free floating question too.

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
