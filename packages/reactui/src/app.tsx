import React from 'react';
import { Toaster } from 'react-hot-toast';

import { nanoid } from '@/reactui/lib/utils';

import { Chat } from '@/reactui/components/chat';
import { Conversation } from '@/reactui/components/conversation';
import messages from '@/reactui/components/messages';
import { FlexiNavbar } from '@/reactui/components/navbar';
import { TailwindIndicator } from '@/reactui/components/tailwind-indicator';

function App() {
  return (
    <div className="app">
      <Toaster />
      <FlexiNavbar />
      <Chat id={nanoid()} initialMessages={messages} />
      {/* <Chat id={nanoid()} initialMessages={[]} /> */}
      <TailwindIndicator />
    </div>
  );
}

export default App;
