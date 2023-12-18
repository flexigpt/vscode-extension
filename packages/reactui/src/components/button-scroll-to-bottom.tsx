import { Box, Button, ButtonProps, Layer } from 'grommet';
import { LinkDown } from 'grommet-icons';
import * as React from 'react';
import { useAtBottom } from '../lib/hooks/use-at-bottom';

export function ButtonScrollToBottom({ ...props }: ButtonProps) {
  const isAtBottom = useAtBottom();

  return (
    <Layer position="bottom-right" modal={false} responsive={false} plain={true}>
      <Box
        pad={{ horizontal: 'small', vertical: 'xsmall' }}
        margin={{ bottom: 'medium', right: 'medium' }}
      >
        <Button
          a11yTitle="Scroll to bottom"
          plain={false}
          icon={<LinkDown />}
          disabled={isAtBottom}
          size="medium"
          onClick={() =>
            window.scrollTo({
              top: document.body.offsetHeight,
              behavior: 'smooth'
            })
          }
          {...props}
        />
      </Box>
    </Layer>
  );
}
