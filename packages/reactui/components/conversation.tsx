import React from 'react';

import { IMessage } from '@/spec/chat';

import { Divider } from '@nextui-org/divider';

import { ChatMessage } from '@/reactui/components/chat-message';

export interface MessageList {
  messages: IMessage[];
}

export function Conversation({ messages }: MessageList) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage message={message} />
          {index < messages.length - 1 && <Divider className="my-4 md:my-8" />}
        </div>
      ))}
    </div>
  );
}
