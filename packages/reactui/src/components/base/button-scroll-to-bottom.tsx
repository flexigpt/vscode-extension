import { Button, ButtonProps } from 'grommet';
import { LinkDown } from 'grommet-icons';
import * as React from 'react';
import { useAtBottom } from '../../lib/hooks/use-at-bottom';

export function ButtonScrollToBottom({ ...props }: ButtonProps) {
  const isAtBottom = useAtBottom();

  return (
    <Button
      a11yTitle="Scroll to bottom"
      plain={false}
      icon={<LinkDown />}
      disabled={isAtBottom}
      size="small"
      onClick={() =>
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: 'smooth'
        })
      }
      {...props}
    />
  );
}
