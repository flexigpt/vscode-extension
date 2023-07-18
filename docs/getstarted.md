## Installation

Download from: [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=ppipada.flexigpt) and follow instructions.

OR

Steps:

1. Install Visual Studio Code 1.74.0 or later
2. Launch Visual Studio Code
3. From the command palette `Ctrl`-`Shift`-`P` (Windows, Linux) or `Cmd`-`Shift`-`P` (macOS), run `> Extensions: Install Extension`.
4. Choose the extension `FlexiGPT` by `ppipada`.
5. Restart Visual Studio Code after the installation

## Configuration

- To configure FlexiGPT, open Visual Studio Code's settings (File > Preferences > Settings or by using the `Ctrl`/`Cmd` + `,` keyboard shortcut) and search for `flexigpt`.
- Configure FlexiGPT level configuration
- Configure an [AI provider](/aiproviders)

### FlexiGPT level configuration

Options:

- flexigpt.promptFiles: A semicolon-separated list of paths to user-defined prompt configuration files. Prompt file configuration is detailed [below](#prompt-file-format).
- flexigpt.inBuiltPrompts: A semicolon-separated list of inbuilt prompt filenames to enable. For multiple names separate with ';'. 'flexigptbasic.js' will always be enabled. Inbuilt prompts can be found at [this path](https://github.com/ppipada/vscode-flexigpt/tree/main/media/prompts). Current values are: "flexigptbasic.js", "gobasic.js" and "gosql.js".
- flexigpt.defaultProvider: The provider to use if multiple providers are configured. Currently, supported values: "openai", "anthropic", "huggingface", "googlegl".

### Sample Full configuration

```json
// flexigpt basic configuration
"flexigpt.promptFiles": "/home/me/my_prompt_files/myprompts.js",
"flexigpt.inBuiltPrompts": "gobasic.js;gosql.js",
"flexigpt.defaultProvider": "openai",

// openai provider configuration
"flexigpt.openai.apiKey": "sk-mkey",
"flexigpt.openai.timeout": "120",
"flexigpt.openai.defaultCompletionModel": "gpt-3.5-turbo",
"flexigpt.openai.defaultChatCompletionModel": "gpt-3.5-turbo",
"flexigpt.openai.defaultEditModel": "code-davinci-edit-001",

// anthropic provider configuration
"flexigpt.anthropic.apiKey": "sk-mkey",
"flexigpt.anthropic.timeout": "120",
"flexigpt.anthropic.defaultCompletionModel": "claude-1-instant",
"flexigpt.anthropic.defaultChatCompletionModel": "claude-1-instant",

// huggingface provider configuration
"flexigpt.huggingface.apiKey": "hf-mkey",
"flexigpt.huggingface.timeout": "120",
"flexigpt.huggingface.defaultCompletionModel": "bigcode/starcoderbase",
"flexigpt.huggingface.defaultChatCompletionModel": "microsoft/DialoGPT-large",

// googlegl provider configuration
"flexigpt.googlegl.apiKey": "gl-mkey",
"flexigpt.googlegl.timeout": "120",
"flexigpt.googlegl.defaultCompletionModel": "text-bison-001",
"flexigpt.googlegl.defaultChatCompletionModel": "chat-bison-001",

```
