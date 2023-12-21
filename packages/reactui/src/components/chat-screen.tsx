import { Box } from 'grommet';
import React, { useState } from 'react';

import { IMessage } from 'spec/chat';

import { Conversation } from './chat-conversation';
import { ChatPanel } from './chat-input-panel';
import { EmptyScreen } from './empty-screen';

const IS_PREVIEW = false;

export interface ChatProps {
  initialMessages: IMessage[];
  id: string;
}

export function Chat({ id, initialMessages }: ChatProps) {
  const [previewToken, setPreviewToken] = useState('');
  const [previewTokenInput, setPreviewTokenInput] = useState(
    previewToken ?? ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const isLoading = true;

  return (
    <Box flex>
      <Box pad={{ bottom: 'xlarge', top: 'small' }} flex={true}>
        {initialMessages.length ? (
          <Conversation messages={initialMessages} />
        ) : (
          <EmptyScreen />
        )}
      </Box>
      <ChatPanel id={id} messages={initialMessages} />
      {/* <KeyForm
        isOpen={isOpen}
        setOpen={setIsOpen}
        previewToken={previewToken}
        setPreviewToken={setPreviewToken}
        previewTokenInput={previewTokenInput}
        setPreviewTokenInput={setPreviewTokenInput}
      /> */}
    </Box>
  );
}
