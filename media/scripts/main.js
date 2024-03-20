// @ts-nocheck

(function () {
  const vscode = acquireVsCodeApi();
  marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, lang) {
      return hljs.highlightAuto(code).value;
    },
    pedantic: false,
    gfm: true,
    breaks: true,
    sanitize: false,
    smartypants: false,
    xhtml: false
  });

  const aiSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41" fill="none" stroke-width="1.5" class="w-5 mr-2"><path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z" fill="currentColor"></path></svg>`;

  const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;

  const clipboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>`;

  const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`;

  const cancelSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;

  const sendSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>`;

  const pencilSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`;

  const plusSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`;

  const insertSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>`;

  let queuedQuestions = 0;

  let preDefinedQuestions = ['Ask anything'];
  let preDefinedConversations = [
    { label: -1, description: 'Load conversation...' }
  ];
  let questionInput = document.getElementById('question-input');
  let autoCompleteList = document.getElementById('commandAutocompleteList');
  let conversationSelectElement = document.getElementById(
    'conversation-select'
  );

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data;
    const list = document.getElementById('qa-list');

    switch (message.type) {
      case 'addQuestion':
        let messageQuestion = message.value;
        if (message.code && typeof message.value === 'string') {
          messageQuestion = marked.parse(
            message.value + '\r\n```\n' + message.code + '\n```'
          );
        }
        const fullPrompt = hljs.highlight('json', message.fullapi).value;
        const fullPromptHTML = `<pre class="input-background p-2 pb-2 block whitespace-pre overflow-x-auto pre-wrap break-word max-w-[80ch]"><code>${fullPrompt}</code></pre>`;

        list.innerHTML += `<div class="p-2 self-end mt-1 question-element-gnc relative input-background">
                        <h7 class="mb-1 flex">${userSvg}You</h7>
                        <no-export-edit class="mb-1 flex items-center">
                            <button title="Edit and resend this prompt" class="resend-element-gnc p-2 flex items-center rounded-lg absolute right-6 top-6">${pencilSvg}</button>
                            <div class="hidden send-cancel-elements-gnc flex gap-2">
                                <button title="Send this prompt" class="send-element-gnc p-2 pr-2 flex items-center">${sendSvg}Send</button>
                                <button title="Cancel" class="cancel-element-gnc p-2 pr-2 flex items-center">${cancelSvg}Cancel</button>
                            </div>
                        </no-export-edit>
                        <div class="overflow-y-auto">
                          ${messageQuestion} <br><br>
                          <div class="accordion rounded-lg">
                            <div class="accordion-item rounded-lg" id=fullprompt-${message.id}>
                              <div class="accordion-title">
                                <h4 class="text-base font-normal">Full prompt</h4>
                                <svg class="w-6 h-6 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                              </div>
                              <div class="accordion-content rounded-lg">
                              ${fullPromptHTML}
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>`;

        const preCodeList = list.lastChild.querySelectorAll('pre>code');

        preCodeList.forEach(preCode => {
          preCode.classList.add(
            'input-background',
            'p-1',
            'pb-1',
            'block',
            'whitespace-pre',
            'overflow-x-auto',
            'pre-wrap',
            'break-word',
            'max-w-[80ch]'
          );
          preCode.parentElement.classList.add('pre-code-element', 'relative');

          const buttonWrapper = document.createElement('no-export');
          buttonWrapper.classList.add(
            'code-actions-wrapper',
            'flex',
            'gap-3',
            'pr-2',
            'pt-1',
            'pb-1',
            'flex-wrap',
            'items-center',
            'justify-end',
            'rounded-t-lg',
            'input-background'
          );

          // Create copy to clipboard button
          const copyButton = document.createElement('button');
          copyButton.title = 'Copy to clipboard';
          copyButton.innerHTML = `${clipboardSvg} Copy`;

          copyButton.classList.add(
            'code-element-gnc',
            'p-2',
            'pr-2',
            'flex',
            'items-center',
            'rounded-lg'
          );

          const newTab = document.createElement('button');
          newTab.title = 'Create a new file with the below code';
          newTab.innerHTML = `${plusSvg} New`;

          newTab.classList.add(
            'new-code-element-gnc',
            'p-2',
            'pr-2',
            'flex',
            'items-center',
            'rounded-lg'
          );

          buttonWrapper.append(copyButton, newTab);

          if (preCode.parentNode.previousSibling) {
            preCode.parentNode.parentNode.insertBefore(
              buttonWrapper,
              preCode.parentNode.previousSibling
            );
          } else {
            preCode.parentNode.parentNode.prepend(buttonWrapper);
          }
        });

        document.getElementById('in-progress')?.classList?.remove('hidden');
        document.getElementById('introduction')?.classList?.add('hidden');
        list.lastChild?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
        queuedQuestions += 1;
        break;
      case 'addResponse':
        queuedQuestions -= 1;
        document.getElementById('in-progress')?.classList?.add('hidden');
        document
          .getElementById('chat-button-wrapper')
          ?.classList?.remove('hidden');
        let existingMessage = message.id && document.getElementById(message.id);
        let markedResponse = marked.parse(message.value);
        // console.log(markedResponse);
        if (existingMessage) {
          existingMessage.innerHTML = markedResponse;
        } else {
          if (message.done) {
            const fullRPrompt = hljs.highlight(
              'json',
              message.fullResponse
            ).value;
            const fullRPromptHTML = `<pre class="input-background p-2 pb-2 block whitespace-pre overflow-x-auto pre-wrap break-word max-w-[80ch]"><code>${fullRPrompt}</code></pre>`;
            markedResponse += `<br><div class="accordion rounded-lg">
                              <div class="accordion-item rounded-lg" id=fullresponse-${message.id}>
                                <div class="accordion-title">
                                  <h4 class="text-base font-normal">Full Response</h4>
                                  <svg class="w-6 h-6 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                  </svg>
                                </div>
                                <div class="accordion-content rounded-lg">
                                ${fullRPromptHTML}
                                </div>
                              </div>
                            </div>`;
          }
          list.innerHTML += `<div class="p-2 self-end mt-1 pb-4 answer-element-gnc">
                        <h7 class="mb-1 flex">${aiSvg}FlexiGPT</h7>
                        <div class="result-streaming" id="${message.id}">
                          ${markedResponse}
                        </div>
                        </div>`;

          list.lastChild?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }

        if (message.done) {
          const preCodeList = list.lastChild.querySelectorAll('pre>code');

          preCodeList.forEach(preCode => {
            preCode.classList.add(
              'input-background',
              'p-1',
              'pb-1',
              'block',
              'whitespace-pre',
              'overflow-x-auto',
              'pre-wrap',
              'break-word',
              'max-w-[80ch]'
            );
            preCode.parentElement.classList.add('pre-code-element', 'relative');

            const buttonWrapper = document.createElement('no-export');
            buttonWrapper.classList.add(
              'code-actions-wrapper',
              'flex',
              'gap-3',
              'pr-2',
              'pt-1',
              'pb-1',
              'flex-wrap',
              'items-center',
              'justify-end',
              'rounded-t-lg',
              'input-background'
            );

            // Create copy to clipboard button
            const copyButton = document.createElement('button');
            copyButton.title = 'Copy to clipboard';
            copyButton.innerHTML = `${clipboardSvg} Copy`;

            copyButton.classList.add(
              'code-element-gnc',
              'p-2',
              'pr-2',
              'flex',
              'items-center',
              'rounded-lg'
            );

            const insert = document.createElement('button');
            insert.title = 'Insert the below code to the current file';
            insert.innerHTML = `${insertSvg} Insert`;

            insert.classList.add(
              'edit-element-gnc',
              'p-2',
              'pr-2',
              'flex',
              'items-center',
              'rounded-lg'
            );

            const newTab = document.createElement('button');
            newTab.title = 'Create a new file with the below code';
            newTab.innerHTML = `${plusSvg} New`;

            newTab.classList.add(
              'new-code-element-gnc',
              'p-2',
              'pr-2',
              'flex',
              'items-center',
              'rounded-lg'
            );

            buttonWrapper.append(copyButton, insert, newTab);

            if (preCode.parentNode.previousSibling) {
              preCode.parentNode.parentNode.insertBefore(
                buttonWrapper,
                preCode.parentNode.previousSibling
              );
            } else {
              preCode.parentNode.parentNode.prepend(buttonWrapper);
            }
          });

          existingMessage = document.getElementById(message.id);
          existingMessage.classList.remove('result-streaming');

          list.lastChild?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
        break;
      case 'addError':
        if (!list.innerHTML) {
          return;
        }

        const messageValue =
          message.value ||
          'An error occurred. If this issue persists, restart your Visual Studio Code. If you still experience issues, it may be due to outage on https://openai.com services.';

        list.innerHTML += `<div class="p-2 self-end mt-1 pb-4 error-element-gnc">
                        <h7 class="mb-1 flex">${aiSvg}FlexiGPT</h7>
                        <div class="text-red-400">${marked.parse(
                          messageValue
                        )}</div>
                    </div>`;

        if (--queuedQuestions === 0) {
          document.getElementById('in-progress')?.classList?.add('hidden');
        }

        list.lastChild?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
        break;
      case 'saveConversation':
        saveConversation();
        break;
      case 'clearConversation':
        clearConversation();
        break;
      case 'exportConversation':
        exportConversation();
        break;
      case 'loginSuccessful':
        document.getElementById('login-button')?.classList?.add('hidden');
        break;
      case 'focus':
        focus();
        break;
      case 'setCommandList':
        preDefinedQuestions = message.data.map(function (item) {
          return item.label;
        });
        // populatePredefinedQuestions();
        populateQuestionsFilteredByInput();
        break;
      case 'setConversationList':
        // console.log(`${JSON.stringify(message.data)}`);
        preDefinedConversations = message.data.map(function (item) {
          return { label: item.label, description: item.description };
        });
        populatePredefinedConversations();
        // console.log(`predefinedConversations: ${JSON.stringify(preDefinedConversations)}`);
        break;
      case 'setConversationsView':
        clearView();
        message.data.forEach(chatMessage => {
          // Construct the event data
          let eventData = {
            type: chatMessage.type,
            value: chatMessage.value,
            id: chatMessage.id
          };

          if (chatMessage.type === 'addQuestion') {
            eventData['fullapi'] = chatMessage.full;
          } else if (chatMessage.type === 'addResponse') {
            eventData['fullResponse'] = chatMessage.full;
            eventData['done'] = chatMessage.params?.done;
            eventData['docLanguage'] = chatMessage.params?.docLanguage;
          }
          // Dispatch the event as if it was received from the extension
          window.dispatchEvent(
            new MessageEvent('message', { data: eventData })
          );
        });
        break;
      default:
        break;
    }
  });

  const focus = () => {
    window.focus();
  };

  const addConversationList = () => {
    vscode.postMessage({
      type: 'getConversationListForWebView',
      value: ''
    });
  };

  const addCommandList = () => {
    vscode.postMessage({
      type: 'getCommandListForWebView',
      value: ''
    });
  };

  const keyEventHash = new KeyboardEvent('keydown', { key: '#' });
  const keyEventBackspace = new KeyboardEvent('keydown', { key: 'Backspace' });

  const addFreeTextQuestion = () => {
    let input = document.getElementById('question-input');
    if (input.value?.length > 0) {
      const value = input.value;
      input.value = '';
      vscode.postMessage({
        type: 'addFreeTextQuestion',
        value: value
      });
    }
  };

  const saveConversation = () => {
    vscode.postMessage({
      type: 'saveConversation'
    });
  };

  const clearView = () => {
    document.getElementById('qa-list').innerHTML = '';

    document.getElementById('introduction')?.classList?.remove('hidden');
  };

  const clearConversation = () => {
    clearView();
    vscode.postMessage({
      type: 'clearConversation'
    });
  };

  const exportConversation = () => {
    vscode.postMessage({
      type: 'exportConversation'
    });
  };

  document
    .getElementById('question-input')
    .addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        addFreeTextQuestion();
      }
    });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      // Clear the list
      while (autoCompleteList.firstChild) {
        autoCompleteList.removeChild(autoCompleteList.firstChild);
      }
    }
  });

  document.addEventListener('click', e => {
    const targetButton = e.target.closest('button');

    if (e.target?.id === 'settings-button') {
      e.preventDefault();
      vscode.postMessage({
        type: 'openSettings'
      });
      return;
    }

    if (targetButton?.id === 'login-button') {
      e.preventDefault();
      vscode.postMessage({
        type: 'login'
      });
      return;
    }

    if (targetButton?.id === 'ask-button') {
      e.preventDefault();
      addFreeTextQuestion();
      return;
    }

    if (targetButton?.id === 'save-button') {
      e.preventDefault();
      saveConversation();
      return;
    }

    if (targetButton?.id === 'clear-button') {
      e.preventDefault();
      clearConversation();
      return;
    }

    if (targetButton?.id === 'export-button') {
      e.preventDefault();
      exportConversation();
      return;
    }

    if (targetButton?.classList?.contains('resend-element-gnc')) {
      e.preventDefault();
      const question = targetButton.closest('.question-element-gnc');
      const elements = targetButton.nextElementSibling;
      elements.classList.remove('hidden');
      question.lastElementChild?.setAttribute('contenteditable', true);

      targetButton.classList.add('hidden');

      return;
    }

    if (targetButton?.classList?.contains('send-element-gnc')) {
      e.preventDefault();

      const question = targetButton.closest('.question-element-gnc');
      const elements = targetButton.closest('.send-cancel-elements-gnc');
      const resendElement =
        targetButton.parentElement.parentElement.firstElementChild;
      elements.classList.add('hidden');
      resendElement.classList.remove('hidden');
      question.lastElementChild?.setAttribute('contenteditable', false);

      if (question.lastElementChild.textContent?.length > 0) {
        vscode.postMessage({
          type: 'addFreeTextQuestion',
          value: question.lastElementChild.textContent
        });
      }
      return;
    }

    if (targetButton?.classList?.contains('cancel-element-gnc')) {
      e.preventDefault();
      const question = targetButton.closest('.question-element-gnc');
      const elements = targetButton.closest('.send-cancel-elements-gnc');
      const resendElement =
        targetButton.parentElement.parentElement.firstElementChild;
      elements.classList.add('hidden');
      resendElement.classList.remove('hidden');
      question.lastElementChild?.setAttribute('contenteditable', false);
      return;
    }

    if (targetButton?.classList?.contains('code-element-gnc')) {
      e.preventDefault();
      navigator.clipboard
        .writeText(
          targetButton.parentElement?.nextElementSibling?.lastChild?.textContent
        )
        .then(() => {
          targetButton.innerHTML = `${checkSvg} Copied`;

          setTimeout(() => {
            targetButton.innerHTML = `${clipboardSvg} Copy`;
          }, 1500);
        });

      return;
    }

    if (targetButton?.classList?.contains('edit-element-gnc')) {
      e.preventDefault();
      vscode.postMessage({
        type: 'editCode',
        value:
          targetButton.parentElement?.nextElementSibling?.lastChild?.textContent
      });

      return;
    }

    if (targetButton?.classList?.contains('new-code-element-gnc')) {
      e.preventDefault();
      vscode.postMessage({
        type: 'openNew',
        value:
          targetButton.parentElement?.nextElementSibling?.lastChild?.textContent
      });

      return;
    }
    // console.log("near seeing accordian item");
    // Check if the click occurred on the accordion item box
    const targetAccordionItem = e.target.closest('.accordion-item');
    if (targetAccordionItem) {
      // console.log("found accordian item");
      targetAccordionItem.classList.toggle('active');
    }

    let autoList = document.getElementById('commandAutocompleteList');
    // Collapse autocomplete list if click is outside it
    if (autoList && !autoList.contains(e.target)) {
      while (autoList.firstChild) {
        autoList.removeChild(autoList.firstChild);
      }
    }
  });

  const populateQuestionsFilteredByInput = () => {
    // Get the input value
    let inputValue = questionInput.value;

    // Filter the list based on the input value
    let filteredList = preDefinedQuestions.filter(function (string) {
      // return (
      //   string.substr(0, inputValue.length).toLowerCase() ===
      //   inputValue.toLowerCase()
      // );
      return string.toLowerCase().includes(inputValue.toLowerCase());
    });

    filteredList.sort((a, b) => {
      if (a > b) {
        return -1;
      } else if (b > a) {
        return 1;
      } else {
        return 0;
      }
    });
    // filteredList.reverse();

    // Clear the list
    while (autoCompleteList.firstChild) {
      autoCompleteList.removeChild(autoCompleteList.firstChild);
    }

    // Populate the autocomplete list with filtered items
    for (let i = 0; i < filteredList.length; i++) {
      let item = document.createElement('div');
      item.innerHTML = filteredList[i];
      autoCompleteList.appendChild(item);
    }
  };

  // Listen for input changes
  questionInput.addEventListener('input', function () {
    populateQuestionsFilteredByInput();
  });

  // Listen for clicks on the textarea
  questionInput.addEventListener('click', function () {
    addCommandList();
    populateQuestionsFilteredByInput();
  });

  // Listen for item clicks
  autoCompleteList.addEventListener('click', function (event) {
    // Add the clicked item to the textarea
    questionInput.value = event.target.innerHTML;

    // Clear the list
    while (autoCompleteList.firstChild) {
      autoCompleteList.removeChild(autoCompleteList.firstChild);
    }
  });

  const populatePredefinedConversations = () => {
    // Loop through the array of messages and generate an option element for each one
    // Use the message ID and a short excerpt of the 0th message as the title
    // Store the full message object as a data attribute on the option element
    // Use the index of the message in the array as the value of the option element
    // Clear any existing options
    conversationSelectElement.innerHTML =
      '<option value="">Load conversation...</option>';
    for (value of preDefinedConversations) {
      if (value.label < 0) {
        return;
      }
      const optionElement = document.createElement('option');
      optionElement.value = value.label;
      optionElement.setAttribute('data-message', JSON.stringify(value));
      // optionElement.textContent = description;
      optionElement.text = value.description;
      conversationSelectElement.appendChild(optionElement);
      // console.log(`added option element: ${JSON.stringify(optionElement)}`);
    }
  };

  conversationSelectElement.addEventListener('focus', function (event) {
    addConversationList();
  });

  // Add an event listener to the select element to listen for changes
  conversationSelectElement.addEventListener('change', event => {
    // Retrieve the selected option element and its associated message object
    const selectedOption =
      conversationSelectElement.options[
        conversationSelectElement.selectedIndex
      ];
    const selectedMessage = JSON.parse(
      selectedOption.getAttribute('data-message')
    );
    // console.log(`Got message: value ${selectedOption.value}, ${selectedOption.getAttribute("data-message")}, selected: ${JSON.stringify(selectedMessage)}`);

    vscode.postMessage({
      type: 'loadConversation',
      value: selectedMessage
    });
    // Use the selected message object as needed
    // console.log(selectedMessage);
  });
})();
