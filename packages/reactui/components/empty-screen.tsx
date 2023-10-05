import * as React from 'react';

import { Button } from '@nextui-org/button';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Divider } from '@nextui-org/divider';
import { Link } from '@nextui-org/link';

import { IconArrowRight } from '@/components/ui/icons';

import { UseChatHelpers } from 'ai/react';

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
        <Link
          isExternal
          showAnchorIcon
          className="text-xs text-default-500 text-muted-foreground"
          href="https://github.com/ppipada/vscode-flexigpt"
        >
          Visit source code on GitHub.
        </Link>
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
              variant="light"
              className="h-auto p-2 text-base"
              // onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
