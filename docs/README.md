Interact with GPT AI models as a power user.

- Supports multiple [AI providers](/aiproviders)

  - [OpenAI GPT3.5/4](https://platform.openai.com/docs/api-reference/introduction)
  - [Anthropic Claude 1/2](https://docs.anthropic.com/claude/reference/complete_post)
  - [HuggingFace Inference API](https://huggingface.co/docs/api-inference/detailed_parameters)
  - Google Generative Language API i.e [PaLM API](https://developers.generativeai.google/api/rest/generativelanguage)

- Rich prompt engineering support

  - Inbuilt pre-defined prompts providing large set of [features](/features)
    - Refactor selection
    - Generate unit test
    - Complete
    - Explain code
    - Generate Documentation
    - Find problems
    - Optimize selection
  - Openly available [prompt files](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts) that can be tweaked as needed.
  - Prompts can be enriched with custom or predefined functions that can be engineered and fine-tuned to meet specific user needs.
  - Prompts can be saved and used directly within VSCode
  - Modify request parameters for GPT APIs as needed
  - Post-process response via responseHandlers in prompts.

- [Flexible UI](/features)
  - Chat activity bar interface for request/response interaction
    - Load/save conversations from history
    - Export conversations to a file
    - Copy/Insert/Create new files out of GPT response.
  - Ask FlexiGPT via editor/command context (select and right-click)
  - Ask FlexiGPT via command palette control (ctrl/cmd + shift + p)
