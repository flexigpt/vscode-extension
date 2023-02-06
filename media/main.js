// @ts-ignore

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  const clipboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>`;

  const insertSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>`;

  let response = "";

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "addResponse": {
        response = message.value;
        setResponse(response);
        break;
      }
      case "clearResponse": {
        response = "";
        break;
      }
      case "setPrompt": {
        document.getElementById("prompt-input").value = message.value;
        break;
      }
    }
  });

  function fixCodeBlocks(response) {
    // Use a regular expression to find all occurrences of the substring in the string
    const REGEX_CODEBLOCK = new RegExp("```", "g");
    const matches = response.match(REGEX_CODEBLOCK);

    // Return the number of occurrences of the substring in the response, check if even
    const count = matches ? matches.length : 0;
    if (count % 2 === 0) {
      return response;
    } else {
      // else append ``` to the end to make the last code block complete
      return response.concat("\n```");
    }
  }

  function setResponse() {
    var converter = new showdown.Converter({
      omitExtraWLInCodeBlocks: true,
      simplifiedAutoLink: true,
      excludeTrailingPunctuationFromURLs: true,
      literalMidWordUnderscores: true,
      simpleLineBreaks: true,
    });

    response = fixCodeBlocks(response);

    html = converter.makeHtml(response);
    document.getElementById("response").innerHTML = html;

    var preCodeBlocks = document.querySelectorAll("pre > code");
    for (var i = 0; i < preCodeBlocks.length; i++) {
      preCodeBlocks[i].classList.add(
        // "p-2",
        // "my-2",
        // "block",
        // "overflow-x-scroll"
        "edit-element-gnc",
        "p-2",
        "flex",
        "items-center",
        "rounded-lg"
      );

      const d = document.createElement("div");
      d.innerHTML = preCodeBlocks[i].innerHTML;
      preCodeBlocks[i].innerHTML = null;
      preCodeBlocks[i].appendChild(d);
      d.classList.add("code");
    }

    var codeBlocks = document.querySelectorAll("code");
    for (var i = 0; i < codeBlocks.length; i++) {
      // Check if innertext starts with "Copy code"
      if (codeBlocks[i].innerText.startsWith("Copy code")) {
        codeBlocks[i].innerText = codeBlocks[i].innerText.replace(
          "Copy code",
          ""
        );
      }

      codeBlocks[i].classList.add(
        "inline-flex",
        "max-w-full",
        "overflow-hidden",
        "rounded-sm",
        "cursor-pointer"
      );

      codeBlocks[i].addEventListener("click", function (e) {
        e.preventDefault();
        vscode.postMessage({
          type: "codeSelected",
          value: this.innerText,
        });
      });

      // Create copy to clipboard button
      const copyButton = document.createElement("button");
      copyButton.title = "Copy to clipboard";
      copyButton.innerHTML = clipboardSvg;

      copyButton.classList.add(
        "code-element-gnc",
        "p-2",
        "flex",
        "items-center",
        "rounded-lg"
      );

      const insert = document.createElement("button");
      insert.title = "Insert the below code to the current file";
      insert.innerHTML = insertSvg;

      insert.classList.add(
        "edit-element-gnc",
        "p-2",
        "flex",
        "items-center",
        "rounded-lg"
      );

      const d = document.createElement("div");
      d.innerHTML = codeBlocks[i].innerHTML;
      codeBlocks[i].innerHTML = null;
      codeBlocks[i].appendChild(d);
      d.classList.add("code");
    }

    microlight.reset("code");

    document.getElementById("response").innerHTML = document
      .getElementById("response")
      .innerHTML.replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  // Listen for keyup events on the prompt input element
  document
    .getElementById("prompt-input")
    .addEventListener("keyup", function (e) {
      // If the key that was pressed was the Enter key
      if (e.keyCode === 13) {
        vscode.postMessage({
          type: "prompt",
          value: this.value,
        });
      }
    });
})();
