import { cn } from '@/reactui/lib/utils'
import * as React from 'react';

export function SidebarFooter({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center justify-between p-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}
