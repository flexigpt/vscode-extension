import React from 'react';

import { Toaster } from 'react-hot-toast';
import { FlexiNavbar } from '@/reactui/components/navbar';
import { Chat } from '@/reactui/components/chat';
import { TailwindIndicator } from '@/reactui/components/tailwind-indicator';
import { Conversation } from '@/reactui/components/conversation';
import messages from '@/reactui/components/messages';
import { nanoid } from '@/reactui/lib/utils';

function App() {
  return (
    <div className="app">
      <Toaster />
      <FlexiNavbar />
      <Chat id={nanoid()} initialMessages={messages} />
      {/* <Conversation messages={messages} /> */}
      <TailwindIndicator />
    </div>
  );
}

export default App;
