import { Box, Grommet, Layer } from 'grommet';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '../globals/globals.css';

import { nanoid } from './lib/utils';

import { Chat } from './components/chat-screen';

import { AppHeader } from './components/navbar';

import { FlexiSidebar } from './components/sidebar';
import messages from './lib/messages-sample';
import { RosePineMergedTheme } from './theme';

import { WorkflowProviderContextProvider } from './lib/contextprovider';

const App: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  const startEmpty = true;
  // const startEmpty = false;
  return (
    <Grommet theme={RosePineMergedTheme} themeMode={themeMode}>
      <WorkflowProviderContextProvider>
        <Box fill>
          <AppHeader
            onMenuClick={toggleSidebar}
            onThemeToggle={toggleTheme}
            theme={'dark'}
          />
          <Box direction="row" flex overflow={{ horizontal: 'hidden' }}>
            {showSidebar && (
              <Layer
                position="left"
                full="vertical"
                modal={false}
                responsive={true}
                onClickOutside={() => setShowSidebar(false)}
                onEsc={() => setShowSidebar(false)}
              >
                <FlexiSidebar />
              </Layer>
            )}
            <Box flex align="center" justify="center">
              {startEmpty ? (
                <Chat id={nanoid()} initialMessages={[]} />
              ) : (
                <Chat id={nanoid()} initialMessages={messages} />
              )}
            </Box>
          </Box>
        </Box>
      </WorkflowProviderContextProvider>
    </Grommet>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

export default App;
