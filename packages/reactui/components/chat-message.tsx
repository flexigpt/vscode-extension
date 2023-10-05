import * as React from 'react';

import { IMessage } from 'spec/chat';

import { cn } from '@/lib/utils';

import { ChatMessageContent } from '@/components/chat-message-content';
import { CopyButton } from '@/components/ui/copy-button';
import {
  IconFlexiGPT,
  IconOpenAI,
  IconUser
} from '@/components/ui/icons';

export interface ChatMessageProps {
  message: IMessage;
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          'bg-background'
        )}
      >
        {message.role === 'user' ? (
          <IconUser />
        ) : (
          <IconFlexiGPT className="h-6 w-6" />
        )}
      </div>
      <ChatMessageContent content={message.content} />
      <div
        className="flex h-8 w-8 items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0"
        {...props}
      >
        <CopyButton
          className="w-8 h-8 justify-center"
          value={message.content}
          variant="ghost"
          size="sm"
        />
      </div>
    </div>
  );
}
