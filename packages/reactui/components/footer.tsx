import * as React from 'react';

import { cn } from '@/reactui/lib/utils';

import { Link } from '@nextui-org/link';

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      <Link
        className="px-2 text-center text-xs leading-normal"
        href="https://github.com/ppipada/vscode-flexigpt"
      >
        FlexiGPT
      </Link>
      {''}
    </p>
  );
}
