import React, { FC, useState } from 'react';

import { Button, ButtonProps } from 'grommet';
import { Checkmark, Copy } from 'grommet-icons';

export interface CopyButtonProps extends ButtonProps {
  value?: string;
}

export const CopyButton: FC<CopyButtonProps> = ({ value, ...buttonProps }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) {
      return;
    }
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      icon={copied ? <Checkmark /> : <Copy />}
      onClick={handleCopy}
      className="absolute z-50 right-3 top-8 border-1 border-transparent bg-transparent before:bg-white/10 before:content-[''] before:block before:z-[-1] before:absolute before:inset-0 before:backdrop-blur-md before:backdrop-saturate-100 before:rounded-lg"
      {...buttonProps}
    />
  );
};
