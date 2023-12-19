import { Box, Grommet, Layer } from 'grommet';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '../globals/globals.css';

import { nanoid } from './lib/utils';

import { Chat } from './components/chat-screen';

import { AppHeader } from './components/navbar';
import messages from './lib/messages-sample';

import { FlexiSidebar } from './components/sidebar';
import { RosePineMergedTheme } from './theme';

const App: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  return (
    <Grommet theme={RosePineMergedTheme} themeMode={themeMode}>
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
            <Chat id={nanoid()} initialMessages={messages} />
          </Box>
        </Box>
      </Box>
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
