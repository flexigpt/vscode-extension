import * as React from 'react';

import { IMessage } from 'spec/chat';

import { Button } from 'grommet';
import { Refresh, Stop } from 'grommet-icons';

import { PromptForm } from '@/components/chat-panel-prompt-input';
import { ButtonScrollToBottom } from '@/components/ui/button-scroll-to-bottom';

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
              onClick={() => stop()}
              className="bg-background"
              icon={<Stop />}
              tip={'Stop generating'}
            ></Button>
          ) : (
            messages?.length > 0 && (
              <Button
                // onClick={() => reload()}
                className="bg-background"
                icon={<Refresh />}
                tip={'Regenerate response'}
              ></Button>
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
