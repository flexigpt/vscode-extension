import * as React from 'react';

import { cn } from '../../lib/utils';

export function IconFlexiGPT({ className, ...props }: React.ComponentProps<'img'>) {
  const iconPath = (window as any).__ICON_PATHS__.icon36x36;
  return (
    <div>
      <img
        src={iconPath}
        alt="FlexiGPT"
        className={cn('h-9 w-9', className)}
        {...props}
      />
    </div>
  );
}



