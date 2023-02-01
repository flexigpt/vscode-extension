import { Configuration, CreateImageRequest, OpenAIApi } from 'openai';
import { Strategy } from './strategy';
import { unescapeChars } from './regexmatcher';

export default class Codex implements Strategy {
  #api: OpenAIApi;
  #timeout: BigInt;

  constructor(apiKey: string, timeout: BigInt) {
    const configuration = new Configuration({ apiKey: apiKey });
    this.#api = new OpenAIApi(configuration);
    this.#timeout = timeout;
  }

  async generate(input: string) {
    const { data } = await this.#api.createCompletion({
      model: 'text-davinci-003',
      prompt: input,
      temperature: 0,
      max_tokens: 1024,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
      stream: false
    });

    // const { data } = await this.#api.createEdit({
    //   model: 'code-davinci-edit-001',
    //   input: '',
    //   instruction: input,
    //   temperature: 0
    // });

    return data.choices[0].text ? unescapeChars(data.choices[0].text) : null;
  }

  async refactor(input: string) {
    const { data } = await this.#api.createEdit({
      model: 'code-davinci-edit-001',
      input,
      instruction: 'Refactor this function',
      temperature: 0
    });

    return data.choices[0].text ? unescapeChars(data.choices[0].text) : null;
  }

  async createImage(params: CreateImageRequest) {
    const response = await this.#api.createImage(params);
    return response.data.data[0].url;
  }
}