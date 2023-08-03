<table>
  <tr>
    <td><strong>Functional areas</strong></td>
    <td><strong>Features and Implementations</strong></td>
    <td><strong>Status</strong></td>
  </tr>
  <tr>
    <td rowspan="2"><strong>Flexibility to talk to any AI</strong></td>
    <td>Integration with multiple AI providers through APIs.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Support parameter selection and handle different response structures.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td rowspan="6"><strong>Flexibility to use custom prompts</strong></td>
    <td>Support for prompt engineering that enables creating and modifying prompts via a standard structure.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Allow request parameter modification</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Allow adding custom response handlers to massage the response from AI.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Provide common predefined variables that can be used to enhance the prompts</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Provide extra prompt enhancements using custom variables that can be static or function getters. This should allow function definitions in the prompt structure and integrate the results into prompts. Also allow passing system vars or user vars or static strings as inputs</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Provide capability to evaluate different prompts, assign ELO ratings, choose and save the strongest</td>
    <td>Long term</td>
  </tr>
  <tr>
    <td rowspan="3"><strong>Seamless UI integration</strong></td>
    <td>Design a flexible UI, a chat interface integrated into the VSCode activity bar.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>The UI must support saving, loading, and exporting of conversations.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Implement streaming typing in the UI, creating a feeling that the AI bot is typing itself.</td>
    <td>Long term</td>
  </tr>
  <tr>
    <td rowspan="4"><strong>Adhoc queries/tasks</strong></td>
    <td> Help the developer ask adhoc queries to AI where he can describe the questions or issues to it using the chat interface. This can be used to debug issues, understand behaviour, get hints on things to look out for, etc. The developer should be able to attach code or files to his questions.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td> Provide a way to define pre cooked CLI commands and fire them as needed. Interface to define CLI commands should be similar to prompts.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td> Provide a way to search queries on StackOverflow.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td> Provide a way to get results for queries from StackOverflow answers and corresponding AI answer.</td>
    <td> Long term </td>
  </tr>
  <tr>
    <td rowspan="5"><strong>Code completion and intelligence</strong></td>
    <td>Provide a way to generate code from a code comment</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Provide a way to complete, refactor, edit, or optimize code via the chat interface. Should allow selecting relevant code from editor as needed.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Implement a context management system integrated with the Language Server Protocol (LSP) that can be used to enrich AI interactions.</td>
    <td>Medium term</td>
  </tr>
  <tr>
    <td>Support generating code embeddings to understand the code context and integrate it into prompts.</td>
    <td>Medium term</td>
  </tr>
  <tr>
    <td>Develop an intelligent code completion feature that predicts next lines of code. It should integrate context (LSP or embeddings) into autocomplete prompts and handle autocomplete responses in the UI.</td>
    <td>Medium term</td>
  </tr>
  <tr>
    <td rowspan="5"><strong>Code review and intelligence</strong></td>
    <td>Provide a way to review via the chat interface. Should allow selecting relevant code from editor as needed</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Ability to fetch a Merge/Pull request from Github, Gitlab or other version providers, analyse them and provide review comments. Should provide flexibility to specify review areas and associated priority depending on usecase.</td>
    <td>Medium term</td>
  </tr>
  <tr>
    <td>Provide automated code reviews and recommendations. It should provide subtle indicators for code improvements and handle code review API responses in the UI.</td>
    <td>Long term</td>
  </tr>
  <tr>
    <td>Provide automated refactoring suggestions. This should handle refactoring API responses and display suggestions in the UI.</td>
    <td>Long term</td>
  </tr>
  <tr>
    <td>Provide automated security suggestions. This should be able to identify potential vulnerabilities being added or deviations from security best practices used in code.</td>
    <td>Long term</td>
  </tr>
  <tr>
    <td rowspan="2"><strong>Code documentation assistance</strong></td>
    <td>Generate documentation for the selected code using the chat interface. Should allow selecting relevant code from editor as needed.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td>Develop effective inline documentation assistance. It should automatically generate and update documentation based on the code and display it in the UI.</td>
    <td>Long term</td>
  </tr>
  <tr>
    <td rowspan="3"><strong>Code Understanding and Learning Support</strong></td>
    <td>Provide a way to explain code via the chat interface. Should allow selecting relevant code from editor as needed.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td> Develop/Integrate with an integrated knowledge graph to provide detailed explanations of Services, APIs, methods, algorithms, and concepts the developer is using or may want to use </td>
    <td> Long term </td>
  </tr>
  <tr>
    <td> Integrate graph search into prompts </td>
    <td> Long term </td>
  </tr>
  <tr>
    <td rowspan="2"><strong>Testing</strong></td>
    <td> Provide a way to generate unit tests via the chat interface. Should allow selecting relevant code from editor as needed. Should have ability to insert tests in new files or current file as needed.</td>
    <td>Done</td>
  </tr>
  <tr>
    <td> Provide a way to generate API and associated workflow tests via the chat interface. Should allow selecting relevant code/api definitions from editor as needed. Should have ability to insert tests in new files or current file as needed.</td>
    <td> Short term </td>
  </tr>
</table>
