import { Button, ButtonProps } from 'grommet';
import { Checkmark, Copy } from 'grommet-icons';
import React, { FC, useState } from 'react';

export interface CopyButtonProps extends ButtonProps {
  value?: string;
}

export const CopyButton: FC<CopyButtonProps> = ({ value, ...buttonProps }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    if (!value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  };

  return (
    <Button
      icon={copied ? <Checkmark /> : <Copy />}
      onClick={handleCopy}
      {...buttonProps}
    />
  );
};
