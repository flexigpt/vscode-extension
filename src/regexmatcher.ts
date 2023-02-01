const MARKDOWN_REGEX = /```[\s\S]*?```/g;
const GENERATOR_REGEX = /^\/\/ @ai.*$/gm;

export const getMarkdowns = (text: string) => {
  const markdownMatches = text.match(MARKDOWN_REGEX);

  return markdownMatches?.map(markdownMatch => markdownMatch.slice(3, -3));
};

export const getGeneratorLines = (text: string) => {
  return text.match(GENERATOR_REGEX);
};

export const unescapeChars = (text: string) => {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
};