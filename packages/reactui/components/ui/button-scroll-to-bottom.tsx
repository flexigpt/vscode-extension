import * as React from 'react';

import { useAtBottom } from '@/lib/hooks/use-at-bottom';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from 'grommet';
import { LinkDown } from 'grommet-icons';

export function ButtonScrollToBottom({ ...props }: ButtonProps) {
  const isAtBottom = useAtBottom();

  return (
    <Button
      a11yTitle="Scroll to bottom"
      plain={false}
      icon={<LinkDown />}
      disabled={isAtBottom}
      size="medium"
      className={cn(
        'absolute right-4 top-1 z-10 transition-opacity duration-300 sm:right-8 md:top-2'
      )}
      onClick={() =>
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: 'smooth'
        })
      }
      {...props}
    ></Button>
  );
}
