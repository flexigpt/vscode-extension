

import * as React from 'react';
import Link from 'next/link'

import { type Chat } from '@/spec/chat'
import { cn } from '@/reactui/lib/utils'
import { buttonVariants } from '@/reactui/components/ui/button'
import { IconMessage, IconUsers } from '@/reactui/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/reactui/components/ui/tooltip'

interface SidebarItemProps {
  chat: Chat
  children: React.ReactNode
}

export function SidebarItem({ chat, children }: SidebarItemProps) {
  // const pathname = usePathname()
  const pathname = "myPath"
  const isActive = pathname === chat.path

  if (!chat?.id) return null

  return (
    <div className="relative">
      <div className="absolute left-2 top-1 flex h-6 w-6 items-center justify-center">
        {chat.sharePath ? (
          <Tooltip delayDuration={1000}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <IconUsers className="mr-2" />
            </TooltipTrigger>
            <TooltipContent>This is a shared chat.</TooltipContent>
          </Tooltip>
        ) : (
          <IconMessage className="mr-2" />
        )}
      </div>
      <Link
        href={chat.path}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'group w-full pl-8 pr-16',
          isActive && 'bg-accent'
        )}
      >
        <div
          className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={chat.title}
        >
          <span className="whitespace-nowrap">{chat.title}</span>
        </div>
      </Link>
      {isActive && <div className="absolute right-2 top-1">{children}</div>}
    </div>
  )
}
