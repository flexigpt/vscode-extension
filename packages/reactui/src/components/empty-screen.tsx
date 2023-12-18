import * as React from 'react';

import { Anchor, Button, Card, CardBody, CardHeader } from 'grommet';
import { HorizontalDivider as Divider } from './divider';

import { Next, Share } from 'grommet-icons';

const exampleMessages = [
  {
    heading: 'Explain technical concepts',
    message: `What is a "serverless function"?`
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article for a 2nd grader: \n'
  },
  {
    heading: 'Draft an email',
    message: `Draft an email to my boss about the following: \n`
  }
];

// export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
export function EmptyScreen() {
  return (
    <Card className="relative mx-auto max-w-2xl px-4">
      <CardHeader className="flex flex-col gap-3">
        <p className="text-md text-center">Welcome to FlexiGPT !</p>
        <p className="text-small text-default-500">
          The fully open source AI Assistant.
        </p>
        <Anchor
          label="Visit source code on GitHub."
          icon={< Share />}
          className="text-xs text-default-500 text-muted-foreground"
          href="https://github.com/ppipada/vscode-flexigpt"
          target="_blank"
        >
        </Anchor>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="mt-4 flex flex-col items-start space-y-2">
          <p className="leading-normal text-muted-foreground">
            You can start a conversation here or try the following examples:
          </p>
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              label = {message.heading}
              className="h-auto p-2 text-base"
              icon={< Next className="mr-2 text-muted-foreground"/>}
              // onClick={() => setInput(message.message)}
            >
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
