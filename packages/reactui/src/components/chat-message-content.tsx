import React, { FC, ReactNode, memo } from 'react';

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Markdown,
  Paragraph,
  Text
} from 'grommet';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { CopyButton } from './base/copy-button';
import { DownloadButton } from './base/download-button';

export const MemoizedMarkdown = memo(
  Markdown,
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

const CodeBlock: FC<CodeProps> = memo(({ language, value }) => {
  return (
    <Card
      elevation="none"
      round="medium"
      background="dark-1"
      overflow="hidden"
      margin={{ top: 'small', bottom: 'small' }}
    >
      <CardHeader pad="small" background="dark-2" height="xxsmall">
        <Text>{language}</Text>
        <Box direction="row" flex="shrink" justify="end">
          <DownloadButton language={language} value={value} />
          <CopyButton value={value} />
        </Box>
      </CardHeader>
      <CardBody pad="small">
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
      </CardBody>
    </Card>
  );
});

type divProps = JSX.IntrinsicElements['div'];
interface CodeComponentProps extends divProps {
  node: any; // This can be more specific if you know the structure
  inline?: boolean;
  className?: string;
  children: ReactNode;
}
interface PComponentProps extends divProps {
  children: ReactNode;
}

export function ChatMessageContent({
  content,
  ...props
}: ChatMessageContentProps) {
  const components = {
    p({ children }: PComponentProps) {
      return (
        <Paragraph
          fill
          margin={{ top: 'small', bottom: 'small' }}
          style={{ lineHeight: '1.5' }}
        >
          {children}
        </Paragraph>
      );
    },
    code: ({
      node,
      inline,
      className,
      children,
      ...props
    }: CodeComponentProps) => {
      // Check if it's an inline code or a block
      // console.log({className, inline, node, children, props});
      // console.log(inline);
      if (inline || !className) {
        return (
          <Text as="code" {...props}>
            {children}
          </Text>
        );
      }
      let match = /lang-(\w+)/.exec(className || '');
      if (!match) {
        match = /language-(\w+)/.exec(className || '');
      }
      const language = match && match[1] ? match[1] : 'text';

      return (
        <CodeBlock
          language={language}
          value={String(children).replace(/\n$/, '')}
          {...props}
        />
      );
    }
  };
  return (
    <Box fill>
      <MemoizedMarkdown
        options={{
          overrides: components
        }}
      >
        {content}
      </MemoizedMarkdown>
    </Box>
  );
}
