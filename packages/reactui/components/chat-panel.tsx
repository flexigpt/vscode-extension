import * as React from 'react';

import { IMessage } from '@/spec/chat';

import { Button } from '@nextui-org/button';

import { PromptForm } from '@/reactui/components/chat-panel-prompt-input';
import { ButtonScrollToBottom } from '@/reactui/components/ui/button-scroll-to-bottom';
import { IconRefresh, IconStop } from '@/reactui/components/ui/icons';

export interface ChatPanelProps {
  id?: string;
  messages?: IMessage[];
}

export function ChatPanel({ id, messages }: ChatPanelProps) {
  const isLoading = false;
  if (!messages) {
    messages = [];
  }
  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex h-10 items-center justify-center">
          {isLoading ? (
            <Button
              variant="light"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="light"
                // onClick={() => reload()}
                className="bg-background"
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm />
        </div>
      </div>
    </div>
  );
}
