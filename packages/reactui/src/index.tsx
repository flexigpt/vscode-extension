// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { NextUIProvider } from '@nextui-org/react';

import App from './app';
import '@/globals/globals.css';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

function TopApp() {
  const enableVscodeOnly = (window as any).__VSCodeOnly__;
  const enableMaindebug = false;
  if (enableVscodeOnly || enableMaindebug) {
    console.log('VSCode mode');
    return (
      // <main className="light text-foreground bg-background">
      //   <HashRouter>
      //     <App />
      //   </HashRouter>
      // </main>

      <NextThemesProvider attribute="class" themes={['light']}>
        <HashRouter>
          <App />
        </HashRouter>
      </NextThemesProvider>
    );
  }
  console.log('Using next themes mode');
  return (
    <NextThemesProvider attribute="class" enableSystem>
      <HashRouter>
        <App />
      </HashRouter>
    </NextThemesProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <NextUIProvider>
      <TopApp />
    </NextUIProvider>
  </React.StrictMode>
);
