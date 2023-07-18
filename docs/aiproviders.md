## OpenAI

- OpenAI provider requires an API key to function. You can obtain one from your openAI account settings [here](https://beta.openai.com/account/api-keys).

- Supported [APIs](https://platform.openai.com/docs/api-reference)

  - https://api.openai.com/v1/chat/completions
  - https://api.openai.com/v1/completions

- Supported models - All models supported by above two APIs

  - `gpt-4`
  - `gpt-4-*`
  - `gpt-3.5-turbo`
  - `gpt-3.5-turbo-*`

- FlexiGPT uses defaultChatCompletionModel: `gpt-3.5-turbo`, unless the prompt overrides it.

- Configuration Options:

  - flexigpt.openai.apiKey: Your OpenAI API key.
  - flexigpt.openai.timeout: The timeout for OpenAI requests, in seconds. Default: 120.
  - flexigpt.openai.defaultChatCompletionModel: Default model to use for chat completion requests.
    - You can always override the default model per prompt via the prompt file command declaration.
    - FlexiGPT basic prompts will use the default models set.
    - Default: `gpt-3.5-turbo`. Note that `gpt-3.5-turbo` usage is accounted in OpenAIs billing. Only free model that is in beta as of Feb 2023 is codex (`code-davinci-002`).
  - flexigpt.openai.defaultCompletionModel: Default model to use for completion requests.

## Anthropic (Claude)

- Anthropic provider requires an API key to function. You can obtain one from the Anthropic website [here](https://docs.anthropic.com/claude/docs/getting-access-to-claude).

- Supported [API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

  - https://api.anthropic.com/v1/complete

- Supported models - All models supported by above API

  - `claude-2`
  - `claude-1`
  - `claude-instant-1`

- FlexiGPT uses defaultChatCompletionModel: `claude-2`, unless the prompt overrides it.

- Configuration Options:

  - flexigpt.anthropic.apiKey: Your Anthropic API key.
  - flexigpt.anthropic.timeout: The timeout for Anthropic requests, in seconds. Default: 120.
  - flexigpt.anthropic.defaultChatCompletionModel: Default model to use for chat completion requests.
    - You can always override the default model per prompt via the prompt file command declaration.
    - FlexiGPT basic prompts will use the default models set.
    - Default: `claude-2`.
  - flexigpt.anthropic.defaultCompletionModel: Default model to use for completion requests.

## Huggingface

- Huggingface provider requires an API key to function. You can obtain one from the huggingface website [here](https://huggingface.co/settings/tokens).

- Supported [API](https://huggingface.co/docs/api-inference/quicktour)

  - https://api-inference.huggingface.co/models/<MODEL_ID>

- Supported models - All models supported by above API

- FlexiGPT uses defaultChatCompletionModel: `DialoGPT-large`, unless the prompt overrides it.

- Configuration Options:

  - flexigpt.huggingface.apiKey: Your Huggingface API key.
  - flexigpt.huggingface.timeout: The timeout for huggingface requests, in seconds. Default: 120.
  - flexigpt.huggingface.defaultChatCompletionModel: Default model to use for chat completion requests.
    - You can always override the default model per prompt via the prompt file command declaration.
    - FlexiGPT basic prompts will use the default models set.
    - Default: `microsoft/DialoGPT-large`.
  - flexigpt.huggingface.defaultCompletionModel: Default model to use for completion requests.
    - Default: `bigcode/starcoderbase`.

## Google generative language (PaLM API)

- Googlegl provider requires an API key to function. You can obtain one from the website [here](https://developers.generativeai.google/tutorials/setup).

- Supported [APIs](https://developers.generativeai.google/api/rest/generativelanguage)

  - https://generativelanguage.googleapis.com/v1beta2/{model=models/*}:generateMessage
  - https://generativelanguage.googleapis.com/v1beta2/{model=models/*}:generateText

- Supported models - All models supported by above APIs

  - `chat-bison-001`
  - `text-bison-001`

- FlexiGPT uses defaultChatCompletionModel: `chat-bison-001`, unless the prompt overrides it.

- Configuration Options:

  - flexigpt.googlegl.apiKey: Your API key.
  - flexigpt.googlegl.timeout: The timeout for requests, in seconds. Default: 120.
  - flexigpt.googlegl.defaultChatCompletionModel: Default model to use for chat completion requests.
    - You can always override the default model per prompt via the prompt file command declaration.
    - FlexiGPT basic prompts will use the default models set.
    - Default: `chat-bison-001`.
  - flexigpt.googlegl.defaultCompletionModel: Default model to use for completion requests.
    - Default: `text-bison-001`.
