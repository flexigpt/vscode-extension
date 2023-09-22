// App.tsx
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Chat } from '@/reactui/components/chat';
import { Providers } from '@/reactui/components/providers';
import { Header } from '@/reactui/components/header';

// eslint-disable-next-line @typescript-eslint/naming-convention
const App = () => {
  return (
    <>
      <Toaster />
      <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <main className="flex flex-col flex-1 bg-muted/50">
                <Chat id={nanoid()} />
              {/* Add more Routes here as needed */}
            </main>
          </div>
      </Providers>
    </>
  );
};

export default App;
