import React from 'react';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Text
} from 'grommet';
import { Info, Refresh, Stop, User } from 'grommet-icons';
import { ChatMessageContent } from './chat-message-content';

import { IMessage } from 'spec/chat';
import { CopyButton } from './base/copy-button';
import { HorizontalDivider } from './base/divider';

export interface MessageList {
  messages: IMessage[];
}

export function Conversation({ messages }: MessageList) {
  if (!messages.length) {
    return null;
  }

  return (
    <Box gap="small" pad="xsmall">
      {' '}
      {/* Replaced div with Box */}
      {messages.map((message, index) => (
        <Box key={index}>
          {' '}
          {/* Replaced div with Box */}
          <ChatMessage message={message} />
          {index < messages.length - 1 && <HorizontalDivider />}
        </Box>
      ))}
    </Box>
  );
}

export interface ChatMessageProps {
  message: IMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [showCopy, setShowCopy] = React.useState(false);
  const isLoading = false;
  return (
    <Card
      elevation="none"
      margin={{ bottom: 'xsmall' }}
      pad="small"
      width={{max: "xlarge"}}
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
    >
      <CardHeader direction="row" align="center" gap="small" height="xxsmall">
        {message.role === 'user' ? (
          <Box direction="row" gap="xsmall">
            <User /> <Text weight="bold">You</Text>
          </Box>
        ) : (
          <Box direction="row" gap="xsmall">
            <Info /> <Text weight="bold"> Assistant </Text>
          </Box>
        )}

        {showCopy && (
          <Box justify="end" flex="shrink">
            <CopyButton value={message.content} />
          </Box>
        )}
      </CardHeader>
      <CardBody background="background-contrast" round="medium" pad="medium">
        <ChatMessageContent content={message.content} />
      </CardBody>
      <CardFooter justify="end" pad="none" margin="none" height="xxsmall">
        {isLoading && message.role === 'assistant' && showCopy && (
          <Button
            onClick={() => stop()}
            icon={<Stop />}
            tip={{
              content: 'Stop generating',
              dropProps: { align: { right: 'left' } }
            }}
          />
        )}
        {message.role === 'assistant' && showCopy && (
          <Button
            icon={<Refresh />}
            tip={{
              content: 'Regenerate response',
              dropProps: { align: { right: 'left' } }
            }}
          />
        )}
      </CardFooter>
    </Card>
  );
}
