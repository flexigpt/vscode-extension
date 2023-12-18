import * as React from 'react';

import { IMessage } from 'spec/chat';

import { List } from 'grommet';


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
  const [clicked, setClicked] = React.useState<DropdownItemType|null>(null);
  const [show, setShow] = React.useState(false);

  return (
    <List
      a11yTitle="Conversation selector"
      data={items.map(item => item.label)}
      // ((event: { item?: string | undefined; index?: number | undefined; }) => void) | undefined'.

      onClickItem={(event: { index?: number }) => {
        if (typeof event.index !== 'undefined') {
          const selectedItem = items[event.index];
          setClicked(selectedItem);
          setShow(true);
        }
      }}
    />
  );
}
