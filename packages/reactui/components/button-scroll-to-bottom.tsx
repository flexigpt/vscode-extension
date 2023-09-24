import * as React from 'react';

import { cn } from '@/reactui/lib/utils';
import { useAtBottom } from '@/reactui/lib/hooks/use-at-bottom';

import { Button, ButtonProps } from '@nextui-org/react';
import { IconArrowDown } from '@/reactui/components/ui/icons';

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const isAtBottom = useAtBottom();

  return (
    <Button
      variant="bordered"
      size="sm"
      className={cn(
        'absolute right-4 top-1 z-10 bg-background transition-opacity duration-300 sm:right-8 md:top-2',
        isAtBottom ? 'opacity-0' : 'opacity-100',
        className
      )}
      onClick={() =>
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: 'smooth'
        })
      }
      {...props}
    >
      <IconArrowDown />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
}
