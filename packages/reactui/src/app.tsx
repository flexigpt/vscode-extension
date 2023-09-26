import React from 'react';
import { Toaster } from 'react-hot-toast';

import { nanoid } from '@/reactui/lib/utils';

import { Chat } from '@/reactui/components/chat';
import { Conversation } from '@/reactui/components/conversation';
import messages from '@/reactui/components/messages-sample';
import { FlexiNavbar } from '@/reactui/components/navbar';

function App() {
  return (
    <div className="app">
      <Toaster />
      <FlexiNavbar />
      <Chat id={nanoid()} initialMessages={messages} />
      {/* <Chat id={nanoid()} initialMessages={[]} /> */}
    </div>
  );
}

export default App;
