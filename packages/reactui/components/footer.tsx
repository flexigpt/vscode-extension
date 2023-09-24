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
      Open source AI chatbot built with{' '}
      <Link href="https://nextjs.org">Next.js</Link> and{' '}
      <Link href="https://vercel.com/storage/kv">Vercel KV</Link>.
    </p>
  );
}
