import * as React from 'react';
import Link from 'next/link';

import { cn } from '@/reactui/lib/utils';

import { Button, buttonVariants } from '@/reactui/components/ui/button';
import { Sidebar } from '@/reactui/components/sidebar';
import {
  IconGitHub,
  IconNextChat,
  IconSeparator,
  IconVercel
} from '@/reactui/components/ui/icons';
import { SidebarFooter } from '@/reactui/components/sidebar-footer';
import { ClearHistory } from '@/reactui/components/clear-history';

export function Header() {
  const session = {
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@doe'
    }
  };
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        {session?.user ? (
          <Sidebar>
            <SidebarFooter>
              {/* <ClearHistory clearChats={clearChats} /> */}
            </SidebarFooter>
          </Sidebar>
        ) : (
          <Link href="/" target="_blank" rel="nofollow">
            <IconNextChat className="w-6 h-6 mr-2 dark:hidden" inverted />
            <IconNextChat className="hidden w-6 h-6 mr-2 dark:block" />
          </Link>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/vercel/nextjs-ai-chatbot/"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </a>
        <a
          href="https://github.com/vercel/nextjs-ai-chatbot/"
          target="_blank"
          className={cn(buttonVariants())}
        >
          <IconVercel className="mr-2" />
          <span className="hidden sm:block">Deploy to Vercel</span>
          <span className="sm:hidden">Deploy</span>
        </a>
      </div>
    </header>
  );
}
