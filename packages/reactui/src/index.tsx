// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { HashRouter } from 'react-router-dom';

import App from './app';
import '@/reactui/globals/globals.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <NextUIProvider>
      <NextThemesProvider attribute="class" enableSystem>
        <HashRouter>
          <App />
        </HashRouter>
      </NextThemesProvider>
    </NextUIProvider>
  </React.StrictMode>
);
