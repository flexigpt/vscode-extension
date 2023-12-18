import React, { useState } from 'react';

import { IMessage } from 'spec/chat';

import { cn } from '../lib/utils';



import { ChatPanel } from './chat-panel';
import { Conversation } from './conversation';
import { EmptyScreen } from './empty-screen';
import { KeyForm } from './get-key';
import { ScrollAnchor } from './scroll-anchor';


const IS_PREVIEW = false;
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages: IMessage[];
  id: string;
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const [previewToken, setPreviewToken] = useState('');
  const [previewTokenInput, setPreviewTokenInput] = useState(
    previewToken ?? ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const isLoading = true;
  const setInput = (input: string) => {
    return;
  };
  //   const { messages, append, reload, stop, isLoading, input, setInput } =
  //     useChat({
  //       initialMessages,
  //       id,
  //       body: {
  //         id,
  //         previewToken
  //       },
  //       onResponse(response) {
  //         if (response.status === 401) {
  //           toast.error(response.statusText);
  //         }
  //       }
  //     });
  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {initialMessages.length ? (
          <>
            <Conversation messages={initialMessages} />
            <ScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen />
        )}
      </div>
      <ChatPanel id={id} messages={initialMessages} />
      <KeyForm
        isOpen={isOpen}
        setOpen={setIsOpen}
        previewToken={previewToken}
        setPreviewToken={setPreviewToken}
        previewTokenInput={previewTokenInput}
        setPreviewTokenInput={setPreviewTokenInput}
      />
    </>
  );
}
