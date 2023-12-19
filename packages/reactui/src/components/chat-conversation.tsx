import React from 'react';

import { Box } from 'grommet';
import { User } from 'grommet-icons';
import { IconFlexiGPT } from './base/icons';
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
      elevation="small"
      margin={{ bottom: 'small' }}
      pad="small"
      round="small"
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
      style={{ position: 'relative' }}
    >
      <Box direction="row" align="center" gap="small">
        <Box
          height="xxsmall"
          width="xxsmall"
          align="center"
          justify="center"
          round="full"
          background="background"
        >
          {message.role === 'user' ? <User /> : <IconFlexiGPT />}
        </Box>
        <ChatMessageContent content={message.content} />
      </Box>
      {showCopy && (
        <Box
          style={{
            position: 'absolute',
            top: '0',
            right: '0'
          }}
        >
          <CopyButton value={message.content} size="small" />
        </Box>
      )}
    </Box>
  );
}
