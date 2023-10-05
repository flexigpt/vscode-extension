import * as React from 'react';

import { IMessage } from 'spec/chat';

import { Listbox, ListboxItem } from '@nextui-org/listbox';

import { ChatMessage } from '@/components/chat-message';

export interface ConversationListItems {
  messages: IMessage[];
}

export function ConversationList({ messages }: ConversationListItems) {
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
