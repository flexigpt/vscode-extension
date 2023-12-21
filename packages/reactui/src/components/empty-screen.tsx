import {
  Anchor,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Text
} from 'grommet';
import { Github, Next } from 'grommet-icons';
import * as React from 'react';
import { HorizontalDivider } from './base/divider'; // Your custom HorizontalDivider component

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

export function EmptyScreen() {
  return (
    <Box
      align="center"
      justify="center"
      width="100vw"
      height="80vh"
      overflow="hidden"
    >
      <Card elevation="none" border="all" pad="medium" width={{ max: 'large' }}>
        <CardHeader direction="column" pad="medium">
          <Text textAlign="center" size="medium">
            Welcome to FlexiGPT
          </Text>

          <Anchor
            label="The fully open source AI Assistant."
            icon={<Github />}
            size="small"
            color="text-weak"
            href="https://github.com/ppipada/vscode-flexigpt"
            target="_blank"
          />
        </CardHeader>
        <HorizontalDivider />
        <CardBody pad="medium" overflow="auto">
          <Box gap="small">
            <Text margin='small'>
              You can start a conversation here or try the following examples:
            </Text>
            {exampleMessages.map((message, index) => (
              <Button
                key={index}
                label={message.heading}
                icon={<Next />}
                justify="start"
                // onClick={() => setInput(message.message)}
                // Adjust styling as needed
              />
            ))}
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
}
