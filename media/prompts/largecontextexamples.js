module.exports = {
  namespace: 'LargeContext',
  commands: [
    {
      name: 'Anthropic: Write Go workflow test with swagger',
      template: `Write workflow tests in golang using the following swagger.
            swagger:
            {system.selection}`,
      responseHandler: {
        func: 'writeFile',
        args: {
          filePath: 'user.testFileName'
        }
      },
      description: 'Generate workflow tests for the selected swagger',
      requestparams: {
        model: 'claude-2.1'
      }
    },
    {
      name: 'Anthropic: Find bugs and races',
      template: `Find bugs or race conditions in the below file. List them in priority order. give your reasons for choosing priority. give code after rectifying the top priority item:
            {system.readFile}`,
      description: 'Find bugs and races in the open file',
      requestparams: {
        model: 'claude-2.1'
      }
    },
    {
      name: 'OpenAI: Find bugs and races',
      template: `Find bugs or race conditions in the below code. List them in priority order. give your reasons for choosing priority. give code after rectifying the top priority item:
            {system.selection}`,
      description: 'Find bugs',
      requestparams: {
        model: 'gpt-3.5-turbo-16k'
      }
    },
    {
      name: 'GoogleChat: Explain',
      template: `Explain the below code:
                  {system.selection}`,
      description: 'Explain chat',
      requestparams: {
        model: 'chat-bison-001'
      }
    },
    {
      name: 'GoogleText: Explain',
      template: `Explain the below code:
                  {system.selection}`,
      description: 'Explain text',
      requestparams: {
        model: 'gemini-1.0-pro'
      }
    },
    {
      name: 'HFText: Explain',
      template: `Explain the below code:
                    {system.selection}`,
      description: 'Explain text',
      requestparams: {
        model: 'bigcode/starcoder2-15b'
      }
    },
    {
      name: 'HFChat: Explain',
      template: `Explain the below code:
                      {system.selection}`,
      description: 'Explain text',
      requestparams: {
        model: 'deepseek-ai/deepseek-coder-1.3b-instruct'
      }
    }
  ],
  functions: [{}],
  variables: [
    {
      name: 'unitTestFramework',
      value: 'testing'
    },
    {
      name: 'start',
      value: 'start'
    },
    {
      name: 'end',
      value: 'end'
    },
    {
      name: 'testFileName',
      value: ({ fileFolder, fileName, fileExtension }) =>
        `${fileFolder}\\${fileName}_test.${fileExtension}`
    }
  ]
};
