import React from 'react';

import { ChatMessageContent } from '@/components/chat-message-content';
import { CopyButton } from '@/components/ui/copy-button';
import { IconFlexiGPT } from '@/components/ui/icons';
import { Box, Button, Card } from 'grommet';
import { User } from 'grommet-icons';

import { HorizontalDivider } from '@/components/ui/divider';
import { IMessage } from 'spec/chat';

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
  return (
    <Card
      elevation="small"
      pad="small"
      margin={{ bottom: 'small' }}
      hoverIndicator={true}
    >
      <Box direction="row" align="center" justify="between"
      
      >
        {/* Icon */}
        <Box
          height="xxsmall"
          width="xxsmall"
          align="center"
          justify="center"
          round="small"
        >
          {message.role === 'user' ? <User /> : <IconFlexiGPT />}
        </Box>

        {/* Message Content */}
        <Box flex>
          <ChatMessageContent content={message.content} />
        </Box>

        {/* Copy Button */}
        <Box
          onMouseOver={({ currentTarget }) => (currentTarget.style.opacity = '1')}
          onMouseOut={({ currentTarget }) => (currentTarget.style.opacity = '0')}
          style={{ opacity: 0, transition: 'opacity 0.5s' }}
        >
          <Button
            icon={<CopyButton value={message.content} size="small" />}
            onClick={() => {/* Copy to clipboard logic */}}
            plain
          />
        </Box>
      </Box>
    </Card>
  );
}
