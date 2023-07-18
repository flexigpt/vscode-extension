## Get Code

Get code using a comment in the editor.

- Write a comment asking for a specific code/functionality (Keep your cursor at the end of the same comment line)
- Press `Ctrl` + `Alt` + `G`
  - Also available via select text/code and right-click as `FlexiGPT: Get Code` option to click/enter
- Get code output below your cursor

## Inbuilt Prompts

Steps to get all the below functionality (similar for all configured prompts; inbuilt or custom):

- Select your code in the editor
- Invoke via `Ctrl` + `Alt` + `A`
  - Any other mechanism from [below](#invocation) is also ok
- Click on the respective prompt text

### Refactor selection

Rectify and refactor selected code.

### Generate unit test

Create unit test for selected code.

### Complete

Complete the selection.

### Explain code

Explain the selection.

### Generate Documentation

Generate documentation for the selected code.

### Find problems

Find problems with the selection, fix them and explain what was wrong.

### Optimize selection

Optimize the selected code

## Chat

### UI behavior

- Chat activity bar interface for request/response interaction
- Load/save conversations from history
- Export conversations to a file
- Copy/Insert/Create new files out of GPT response.
- Detailed request and response to/from to GPT APIs available in activity bar itself for better prompt engineering and debugging
- Your prompt history is available at the top of the activity bar.

### Invocation

The chat activity bar can be opened in following ways:

1. Click the FlexiGPT icon in the activity bar
2. Select text/code and right-click i.e editor context: You should get a `FlexiGPT: Ask` option to click/enter
3. Command Palette (`Ctrl`/`Cmd` + `Shift` + `P`): You should get a `FlexiGPT: Ask` option to click/enter
4. Keyboard shortcut: `Ctrl` + `Alt` + `A`

### Prompts behavior

- Click the input text box to load default and configured inbuilt/custom prompts.
- Full behavior and documentation can be found [here](/prompts).

## Search Stack Overflow

Search for stack overflow questions from your editor.

- Press `Ctrl` + `Alt` + `S`
  - Also available via select text/code and right-click as `FlexiGPT: Stackoverfow Search` option to click/enter
- An input box opens with your current line or selection autofilled. You can modify it or use it as is.
- Enter and get search results.
- Click on result to open stack overflow page.
