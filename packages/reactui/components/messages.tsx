import { ChatCompletionRoleEnum, IMessage } from '@/spec/chat';

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
    content: "Great, that's all for now. Thanks!",
    timestamp: '08:44 AM',
    name: 'John Doe'
  },
  {
    id: '16',
    createdAt: new Date('2023-09-24T08:45:00Z'),
    role: ChatCompletionRoleEnum.assistant,
    content: "You're welcome! Let us know if you need any further assistance.",
    timestamp: '08:45 AM',
    name: 'Assistant'
  }
];

export default messages;
