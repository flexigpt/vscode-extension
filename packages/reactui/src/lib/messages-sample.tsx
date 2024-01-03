import { ChatCompletionRoleEnum, IMessage } from 'spec/chat';

const messages: IMessage[] = [
  {
    id: '1',
    createdAt: new Date('2023-09-24T08:30:00Z'),
    role: ChatCompletionRoleEnum.system,
    content: 'Welcome to our chat application!',
    timestamp: '08:30 AM'
  },
  {
    id: '2',
    createdAt: new Date('2023-09-24T08:31:00Z'),
    role: ChatCompletionRoleEnum.user,
    content: 'Hello! I need help with my order.',
    timestamp: '08:31 AM',
    name: 'John Doe'
  },
  {
    id: '3',
    createdAt: new Date('2023-09-24T08:32:00Z'),
    role: ChatCompletionRoleEnum.assistant,
    content: 'Of course, John. Can you provide your order number?',
    timestamp: '08:32 AM',
    name: 'Assistant'
  },
  {
    id: '4',
    createdAt: new Date('2023-09-24T08:33:00Z'),
    role: ChatCompletionRoleEnum.user,
    content: 'My order number is 12345.',
    timestamp: '08:33 AM',
    name: 'John Doe'
  },
  {
    id: '5',
    createdAt: new Date('2023-09-24T08:34:00Z'),
    role: ChatCompletionRoleEnum.assistant,
    content: 'Thank you. I found your order. How can I assist you further?',
    timestamp: '08:34 AM',
    name: 'Assistant'
  },
  {
    id: '6',
    createdAt: new Date('2023-09-24T08:35:00Z'),
    role: ChatCompletionRoleEnum.user,
    content: 'I want to change the delivery address.',
    timestamp: '08:35 AM',
    name: 'John Doe'
  },
  {
    id: '7',
    createdAt: new Date('2023-09-24T08:36:00Z'),
    role: ChatCompletionRoleEnum.assistant,
    content: 'Sure, please provide the new address.',
    timestamp: '08:36 AM',
    name: 'Assistant'
  },
  {
    id: '8',
    createdAt: new Date('2023-09-24T08:37:00Z'),
    role: ChatCompletionRoleEnum.user,
    content: '123 New St, Springfield.',
    timestamp: '08:37 AM',
    name: 'John Doe'
  },
  {
    id: '9',
    createdAt: new Date('2023-09-24T08:38:00Z'),
    role: ChatCompletionRoleEnum.assistant,
    content: 'The address has been updated.',
    timestamp: '08:38 AM',
    name: 'Assistant'
  },
  {
    id: '10',
    createdAt: new Date('2023-09-24T08:39:00Z'),
    role: ChatCompletionRoleEnum.system,
    content: 'Your chat will end in 10 minutes due to inactivity.',
    timestamp: '08:39 AM'
  },
  {
    id: '11',
    createdAt: new Date('2023-09-24T08:40:00Z'),
    role: ChatCompletionRoleEnum.user,
    content: 'Thank you. Also, can I change the delivery date?',
    timestamp: '08:40 AM',
    name: 'John Doe'
  },
  {
    id: '12',
    createdAt: new Date('2023-09-24T08:41:00Z'),
    role: ChatCompletionRoleEnum.assistant,
    content: 'Yes, when would you like the order to be delivered?',
    timestamp: '08:41 AM',
    name: 'Assistant'
  },
  {
    id: '13',
    createdAt: new Date('2023-09-24T08:42:00Z'),
    role: ChatCompletionRoleEnum.user,
    content: 'On 30th September.',
    timestamp: '08:42 AM',
    name: 'John Doe'
  },
  {
    id: '14',
    createdAt: new Date('2023-09-24T08:43:00Z'),
    role: ChatCompletionRoleEnum.assistant,
    content: 'The delivery date has been updated to 30th September.',
    timestamp: '08:43 AM',
    name: 'Assistant'
  },
  {
    id: '15',
    createdAt: new Date('2023-09-24T08:44:00Z'),
    role: ChatCompletionRoleEnum.user,
    content:
      `Great, that's all for now.

May be I will see you again? Thanks a bunch!`,
    timestamp: '08:44 AM',
    name: 'John Doe'
  },
  {
    id: '16',
    createdAt: new Date('2023-09-24T08:45:00Z'),
    role: ChatCompletionRoleEnum.assistant,
    content: `
# My heading

[reference](#)

If Grommet's Markdown component uses \`markdown-to-jsx\` internally, then the types for your custom renderer function should align with what \`markdown-to-jsx\` expects. The \`markdown-to-jsx\` library allows you to provide custom renderers for different Markdown elements, and these custom renderers receive specific props based on the Markdown element they're rendering.

For a \`code\` element, the props typically include those that are passed to any React component, along with some specific to Markdown rendering. Here's how you can define the type for your \`code\` component in this context:

## Sample code

\`\`\`typescript
import React, { FC, ReactNode } from 'react';
// other imports remain the same

interface CodeComponentProps {
  node: any;  // This can be more specific if you know the structure
  inline?: boolean;
  className?: string;
  children: ReactNode;
  // Include other props that markdown-to-jsx might pass
}

const CodeBlock: FC<CodeComponentProps> = ({ node, inline, className, children, ...props }) => {
  // CodeBlock implementation remains the same
};

export const ChatMessageContent: FC<ChatMessageContentProps> = ({ content }) => {
  return (
    <MemoizedMarkdown
      components={{
        code: CodeBlock
      }}
    >
      {content}
    </MemoizedMarkdown>
  );
};
\`\`\`

In this setup:

`,
timestamp: '08:45 AM',
name: 'Assistant'
  },
  {
    id: '17',
    createdAt: new Date('2023-09-24T09:45:00Z'),
    role: ChatCompletionRoleEnum.user,
    content: `
  # Out of Breath

  You know, sometimes in life it seems like there's no way out. Like
  a sheep trapped in a maze designed by wolves. See all the
  options [here](https://github.com/probablyup/markdown-to-jsx/)

  [reference](#)

\`\`\`
import { Grommet } from 'grommet';
\`\`\`

  > i carry your heart with me

  ![alt text](//v2.grommet.io/assets/IMG_4245.jpg "Markdown Image")

  Markdown | Less | Pretty | Long header now | One more for sake of it
  --- | --- | --- | --- | ---
  Content *still* | \`renders\` | **nicely** in a table | **nicely** in a table | **nicely** in a table
  1 | 2 | 3 | 3 | 3
`,
    timestamp: '09:00 AM',
    name: 'John Doe'
  },
  {
    id: '18',
    createdAt: new Date('2023-09-24T09:45:00Z'),
    role: ChatCompletionRoleEnum.assistant,
    content: `

\`\`\`python
def get_openapi_completion_for_integration_sequence_test(intxt, value_type):
  response = openai.Completion.create(
      model="text-davinci-003",
      prompt=prompts.generate_prompt_integration_sequence_test(intxt, value_type),
      temperature=0,
      max_tokens=2560,
      best_of=1,
      stop=["##", "}}}}}}", "Generate workflow", "func Test"])
  
return response
\`\`\`
    `,
    timestamp: '09:45 AM',
    name: 'Assistant'
  }
];

export default messages;
