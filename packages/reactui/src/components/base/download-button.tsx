import React, { FC } from 'react';

import { Button, ButtonProps } from 'grommet';
import { Download } from 'grommet-icons';

import { programmingLanguages } from '../../lib/code-types';
import { generateRandomString } from '../../lib/utils';

export interface DownloadButtonProps extends ButtonProps {
  language: string;
  value: string;
}

export const DownloadButton: FC<DownloadButtonProps> = ({
  language,
  value,
  ...buttonProps
}) => {
  const downloadAsFile = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const fileExtension = programmingLanguages[language] || '.txt';
    const suggestedFileName = `file-${generateRandomString(
      3,
      true
    )}${fileExtension}`;
    // const fileName = window.prompt('Enter file name' || '', suggestedFileName);

    // if (!fileName) {
    //   // User pressed cancel on prompt.
    //   return;
    // }

    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = suggestedFileName;
    link.href = url;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      a11yTitle="Download"
      icon={<Download />}
      onClick={downloadAsFile}
      {...buttonProps}
    />
  );
};
