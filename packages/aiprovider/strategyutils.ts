
export const tempCodeString = `def get_openapi_completion_for_integration_sequence_test(intxt, value_type):
response = openai.Completion.create(
    model="text-davinci-003",
    prompt=prompts.generate_prompt_integration_sequence_test(intxt, value_type),
    temperature=0,
    max_tokens=2560,
    best_of=1,
    stop=["##", "}}}}}}", "Generate workflow", "func Test"])

return response`;

export const promptProcessorString =
  "convert the response after processing previous prompt to a html code that highlights code elements using highlight.js";


const MARKDOWN_REGEX = /```[\s\S]*?```/g;
const GENERATOR_REGEX = /^\/\/ @ai.*$/gm;

export const getMarkdowns = (text: string) => {
  const markdownMatches = text.match(MARKDOWN_REGEX);

  return markdownMatches?.map((markdownMatch) => markdownMatch.slice(3, -3));
};

export const getGeneratorLines = (text: string) => {
  return text.match(GENERATOR_REGEX);
};


