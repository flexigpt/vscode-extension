import * as React from 'react';

import { IMessage } from '@/spec/chat';

import { useCopyToClipboard } from '@/reactui/lib/hooks/use-copy-to-clipboard';
import { cn } from '@/reactui/lib/utils';

import { Button } from '@nextui-org/button';

import { IconCheck, IconCopy } from '@/reactui/components/ui/icons';

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: IMessage;
}

export function ChatMessageActions({
  message,
  className,
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = () => {
    if (isCopied) return;
    copyToClipboard(message.content);
  };

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0',
        className
      )}
      {...props}
    >
      <Button variant="ghost" size="sm" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
    </div>
  );
}
