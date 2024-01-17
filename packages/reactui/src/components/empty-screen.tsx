import {
  Anchor,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text
} from 'grommet';
import { DocumentText, Github, Next } from 'grommet-icons';
import * as React from 'react';
import { DOCS_SITE_URL, GITHUB_REPO_URL } from '../lib/consts';

import { HorizontalDivider } from './base/divider';

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
      height="90vh"
      overflow="hidden"
    >
      <Card elevation="none" border="all" pad="medium" width={{ max: 'large' }}>
        <CardHeader direction="column" pad="medium">
          <Box align="center" justify="center" gap="small">
            <Heading level="2" margin="none">
              Welcome to FlexiGPT
            </Heading>
            <Text size="small" color="text-weak">
              The fully open source AI Assistant
            </Text>
          </Box>

          <Box direction="row" gap="large" align="center" justify="center">
            <Anchor
              label="Docs"
              icon={<DocumentText />}
              size="small"
              color="text-weak"
              href={DOCS_SITE_URL}
              target="_blank"
            />
            <Anchor
              label="Code"
              icon={<Github />}
              href={GITHUB_REPO_URL}
              target="_blank"
              size="small"
              color="text-weak"
            />
          </Box>
        </CardHeader>
        <HorizontalDivider />
        <CardBody pad="medium" overflow="auto">
          <Box gap="small">
            <Text margin="small">
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
