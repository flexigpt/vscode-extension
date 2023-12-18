import { Box, Button } from 'grommet';
import { Copy, Download } from 'grommet-icons';
import React, { FC, memo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodeProps {
  language: string;
  value: string;
}

export const CodeBlock: FC<CodeProps> = memo(({ language, value }) => {
  return (
    <Box fill="horizontal" background="dark-3" pad="small">
      <Box direction="row" justify="between" background="dark-2" pad={{ horizontal: 'medium', vertical: 'small' }}>
        <Box basis="1/4">
          {language}
        </Box>
        <Box direction="row" gap="small">
          <Button icon={<Download />} plain={false} size="small" />
          <Button icon={<Copy />} plain={false} size="small" />
        </Box>
      </Box>
      <SyntaxHighlighter
        language={language}
        style={monokaiSublime}
        showLineNumbers
        customStyle={{
          background: 'transparent',
          padding: 'medium',
          borderRadius: 'small'
        }}
      >
        {value}
      </SyntaxHighlighter>
    </Box>
  );
});


