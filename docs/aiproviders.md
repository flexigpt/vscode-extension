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

- For an example on how to use `Function calling` feature of OpenAI look at this prompt file [here](https://github.com/ppipada/vscode-flexigpt/blob/main/media/prompts/gobasic.js).

- Configuration Options:

  - flexigpt.openai.apiKey: Your OpenAI API key.
  - flexigpt.openai.timeout: The timeout for OpenAI requests, in seconds. Default: 120.
  - flexigpt.openai.defaultChatCompletionModel: Default model to use for chat completion requests.
    - You can always override the default model per prompt via the prompt file command declaration.
    - FlexiGPT basic prompts will use the default models set.
    - Default: `gpt-3.5-turbo`. Note that `gpt-3.5-turbo` usage is accounted in OpenAIs billing. Only free model that is in beta as of Feb 2023 is codex (`code-davinci-002`).
  - flexigpt.openai.defaultCompletionModel: Default model to use for completion requests.
  - flexigpt.openai.defaultOrigin: Default origin to use for requests. This can be used to talk to any server that serves a compatible API.
    - Default: `https://api.openai.com`.

## Anthropic Claude

- Anthropic provider requires an API key to function. You can obtain one from the Anthropic website [here](https://docs.anthropic.com/claude/docs/getting-access-to-claude).

- Supported [API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

  - https://api.anthropic.com/v1/messages
    - `claude-3-*`, `claude-2*`

- FlexiGPT uses defaultChatCompletionModel: `claude-3-haiku-20240307`, unless the prompt overrides it.

- Configuration Options:

  - flexigpt.anthropic.apiKey: Your Anthropic API key.
  - flexigpt.anthropic.timeout: The timeout for Anthropic requests, in seconds. Default: 120.
  - flexigpt.anthropic.defaultChatCompletionModel: Default model to use for chat completion requests.
    - You can always override the default model per prompt via the prompt file command declaration.
    - FlexiGPT basic prompts will use the default models set.
    - Default: `claude-3-haiku-20240307`.
  - flexigpt.anthropic.defaultCompletionModel: Default model to use for completion requests.
  - flexigpt.anthropic.defaultOrigin: Default origin to use for requests. This can be used to talk to any server that serves a compatible API.
    - Default: `https://api.anthropic.com`.

## Huggingface

- Huggingface provider requires an API key to function. You can obtain one from the huggingface website [here](https://huggingface.co/settings/tokens).

- Supported [API](https://huggingface.co/docs/api-inference/quicktour)

  - https://api-inference.huggingface.co/models/<MODEL_ID>

- Supported models - All models supported by above API

- FlexiGPT uses defaultChatCompletionModel: `deepseek-ai/deepseek-coder-1.3b-instruct`, unless the prompt overrides it.

- Configuration Options:

  - flexigpt.huggingface.apiKey: Your Huggingface API key.
  - flexigpt.huggingface.timeout: The timeout for huggingface requests, in seconds. Default: 120.
  - flexigpt.huggingface.defaultChatCompletionModel: Default model to use for chat completion requests.
    - You can always override the default model per prompt via the prompt file command declaration.
    - FlexiGPT basic prompts will use the default models set.
    - Default: `deepseek-ai/deepseek-coder-1.3b-instruct`.
  - flexigpt.huggingface.defaultCompletionModel: Default model to use for completion requests.
    - Default: `bigcode/starcoder2-15b`.
  - flexigpt.huggingface.defaultOrigin: Default origin to use for requests. This can be used to talk to any server that serves a compatible API.
    - Default: `https://api-inference.huggingface.co`.

## Google generative language - Gemini / PaLM2 API

- Googlegl provider requires an API key to function. You can obtain one from the website [here](https://ai.google.dev/tutorials/setup).

- Supported API: https://ai.google.dev/api/rest/v1/models/generateContent

  - `gemini-1.0-pro`
  - `chat-bison-001` (legacy)
  - `text-bison-001` (legacy)

- FlexiGPT uses defaultChatCompletionModel: `gemini-1.0-pro`, unless the prompt overrides it.

- Configuration Options:

  - flexigpt.googlegl.apiKey: Your API key.
  - flexigpt.googlegl.timeout: The timeout for requests, in seconds. Default: 120.
  - flexigpt.googlegl.defaultChatCompletionModel: Default model to use for chat completion requests.
    - You can always override the default model per prompt via the prompt file command declaration.
    - FlexiGPT basic prompts will use the default models set.
    - Default: `gemini-1.0-pro`.
  - flexigpt.googlegl.defaultCompletionModel: Default model to use for completion requests.
    - Default: `gemini-1.0-pro`.
  - flexigpt.googlegl.defaultOrigin: Default origin to use for requests. This can be used to talk to any server that serves a compatible API.
    - Default: `https://generativelanguage.googleapis.com`.

## LLaMA cpp

- Setup a llama.cpp server as noted [here](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)

  - If you are running a python openai compatible server as described [here](https://github.com/ggerganov/llama.cpp/tree/master/examples/server#api-like-oai), you can use the openai provider with modified default origin for talking to llama.cpp too.
  - This provider directly talkes to the default llama server built.

- Supported [APIs](https://github.com/ggerganov/llama.cpp/tree/master/examples/server#api-endpoints)

  - https://`your host:port of the llama server`/completion

- Supported models - All models supported by the above APIs. Note that the model in llama.cpp needs to be given when running the server itself and cannot be given at each request level.

- Configuration Options:

  - flexigpt.llamacpp.apiKey: Your API key.
  - flexigpt.llamacpp.timeout: The timeout for requests, in seconds. Default: 120.
  - flexigpt.llamacpp.defaultOrigin: Default origin to use for requests. This can be used to talk to any server that serves a compatible API.
    - Default: `http://127.0.0.1:8080`.
