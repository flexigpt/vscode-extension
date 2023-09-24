import * as React from 'react';
import { Listbox, ListboxItem } from '@nextui-org/listbox';

import { IMessage as Message } from '@/spec/chat';

import { ChatMessage } from '@/reactui/components/chat-message';

export interface ChatListItems {
  messages: Message[];
}

export function ChatList({ messages }: ChatListItems) {
  type DropdownItemType = {
    key: string;
    label: string;
    index: number;
  };
  const items: DropdownItemType[] = [
    {
      key: 'new',
      label: 'New file',
      index: 0
    },
    {
      key: 'copy',
      label: 'Copy link',
      index: 1
    },
    {
      key: 'edit',
      label: 'Edit file',
      index: 2
    },
    {
      key: 'delete',
      label: 'Delete file',
      index: 3
    }
  ];

  if (!items.length) {
    return null;
  }

  return (
    <Listbox
      items={items}
      aria-label="Conversation selector"
      onAction={key => alert(key)}
    >
      {item => <ListboxItem key={item.key}>{item.label}</ListboxItem>}
    </Listbox>
  );
}
