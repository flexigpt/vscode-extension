// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx
import * as React from 'react';
import { FC, memo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { solarizedLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { CodeProps } from '@/reactui/components/ui/code-types';
import { CopyButton } from '@/reactui/components/ui/copy-button';
import { DownloadButton } from '@/reactui/components/ui/download-button';

const CodeBlock: FC<CodeProps> = memo(({ language, value }) => {
  return (
    <div className="relative w-full font-sans codeblock bg-zinc-950">
      <div className="flex items-center justify-between w-full px-6 py-2 pr-4 bg-zinc-800 text-zinc-100">
        <span className="text-xs lowercase">{language}</span>
        <div className="flex items-center space-x-1">
          <DownloadButton
            className="w-8 h-8 text-zinc-100"
            language={language}
            value={value}
          />
          <CopyButton
            className="w-8 h-8 text-zinc-100"
            value={value}
            variant="bordered"
            size="sm"
          />
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={solarizedLight}
        PreTag="div"
        showLineNumbers
        customStyle={{
          margin: 0,
          width: '100%',
          background: 'transparent',
          padding: '1.5rem 1rem'
        }}
        codeTagProps={{
          style: {
            fontSize: '0.9rem',
            fontFamily: 'var(--font-mono)'
          }
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';

export { CodeBlock };
