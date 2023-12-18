// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx
import React, { FC, memo } from 'react';

import { Box, Button } from 'grommet';
import { Copy, Download } from 'grommet-icons';
import ReactMarkdown, { Options } from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

export interface ChatMessageContentProps {
  content: string;
}


interface CodeProps {
  language: string;
  value: string;
}

export const CodeBlock: FC<CodeProps> = memo(({ language, value }) => {
  return (
    <Box fill="horizontal" background="dark-3" pad="small">
      <Box
        direction="row"
        justify="between"
        background="dark-2"
        pad={{ horizontal: 'medium', vertical: 'small' }}
      >
        <Box basis="1/4">{language}</Box>
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

export function ChatMessageContent({
  content,
  ...props
}: ChatMessageContentProps) {
  return (
    <div className="flex-1 px-1 ml-4 space-y-1 overflow-hidden">
      <MemoizedReactMarkdown
        className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          code({ node, inline, className, children, ...props }) {
            if (children.length) {
              if (children[0] === '▍') {
                return (
                  <span className="mt-1 cursor-default animate-pulse">▍</span>
                );
              }

              children[0] = (children[0] as string).replace('`▍`', '▍');
            }

            const match = /language-(\w+)/.exec(className || '');

            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                key={Math.random()}
                language={(match && match[1]) || ''}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            );
          }
        }}
      >
        {content}
      </MemoizedReactMarkdown>
    </div>
  );
}
