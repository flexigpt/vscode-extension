import * as vscode from "vscode";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import log from "../logger/log";

export async function executeSearch(searchTerm: string): Promise<void> {
  if (!searchTerm || searchTerm.trim() === "") {
    return;
  }

  searchTerm = searchTerm.trim();
  log.info(`Started stackoverflow search with input: [${searchTerm}]`);

//   const stackoverflowApiKey = "<your_stackoverflow_api_key>";
  const encodedSearchTerm = encodeURIComponent(searchTerm);

  // const apiSearchUrl = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${encodedSearchTerm}&site=stackoverflow&key=${stackoverflowApiKey}`;

  const apiSearchUrl = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${encodedSearchTerm}&site=stackoverflow`;
  const questionsMeta = [
    { title: `🌐 🔎 Search Stackoverflow: ${searchTerm}`, url: apiSearchUrl },
  ];

  const requestConfig: AxiosRequestConfig = {
    url: apiSearchUrl,
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
    },
    responseType: "json",
  };
  try {
    const response: AxiosResponse = await axios.request(requestConfig);
    let searchResponse = response.data;
    if (searchResponse.items && searchResponse.items.length > 0) {
      searchResponse.items.forEach((q: any, i: any) => {
        questionsMeta.push({
          title: `${i}: ${q.is_answered ? "✅" : "🤔"} ${q.score}🔺 ${
            q.answer_count
          }❗ ➡️ ${decodeURIComponent(q.title)} 🏷️ ${q.tags.join(",")} 👩‍💻 by ${
            q.owner.display_name
          }`,
          url: q.link,
        });
      });
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios error
      const axiosError = error as AxiosError;
      let errorData = JSON.stringify(axiosError, null, 2) + "\n";
      error.message = errorData + "\n" + error.message;
    }
    throw error;
  }

  const questions = questionsMeta.map((q) => q.title);
  const selectedTitle = await vscode.window.showQuickPick(questions, {
    canPickMany: false,
  });
  const selectedQuestionMeta = questionsMeta.find(
    (q) => q.title === selectedTitle
  );
  const selectedQuestionUrl = selectedQuestionMeta
    ? selectedQuestionMeta.url
    : apiSearchUrl;
  //   log.info(`Selected question url: [${selectedQuestionUrl}]`);
  if (selectedQuestionUrl && selectedQuestionUrl !== "") {
    vscode.env.openExternal(vscode.Uri.parse(selectedQuestionUrl));
  }
}
