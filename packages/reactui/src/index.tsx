// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { NextUIProvider } from '@nextui-org/react';

import App from './app';
import '@/reactui/globals/globals.css';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

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
