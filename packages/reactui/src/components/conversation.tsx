import React from 'react';

import { Box } from 'grommet';
import { User } from 'grommet-icons';
import { ChatMessageContent } from './chat-message-content';
import { IconFlexiGPT } from './icons';

import { IMessage } from 'spec/chat';
import { CopyButton } from './copy-button';
import { HorizontalDivider } from './divider';

export interface MessageList {
  messages: IMessage[];
}

export function Conversation({ messages }: MessageList) {
  if (!messages.length) {
    return null;
  }

  return (
    <Box gap="medium">
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

  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      elevation="small"
      margin={{ bottom: 'small' }}
      pad="small"
      round="small"
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
    >
      <Box
        height="xsmall"
        width="xsmall"
        align="center"
        justify="center"
        round="full"
        background="background"
      >
        {message.role === 'user' ? <User /> : <IconFlexiGPT />}
      </Box>
      <ChatMessageContent content={message.content} />
      {showCopy && <CopyButton value={message.content} size="small" />}
    </Box>
  );
}
