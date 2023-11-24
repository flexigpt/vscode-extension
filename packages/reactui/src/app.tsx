import React from 'react';

import { nanoid } from '@/lib/utils';

import { Chat } from '@/components/chat';
import messages from '@/components/messages-sample';
import { FlexiNavbar } from '@/components/navbar';

function App() {
  return (
    <div className="app">
      {/* <Toaster /> */}
      <FlexiNavbar />
      <Chat id={nanoid()} initialMessages={messages} />
      {/* <Chat id={nanoid()} initialMessages={[]} /> */}
    </div>
  );
}

export default App;
