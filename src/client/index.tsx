import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from 'react';
import initDiscord from './appClient';
import App from './app';
import LoadingScreen from '@/client/components/ui/LoadingScreen';
import ErrorScreen from '@/client/components/ui/ErrorScreen';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/client/styles/theme';
import { GlobalStyle } from '@/client/styles/global';

const app = document.querySelector("#app");

if (!app) {
  throw new Error("Missing #app mount point.");
}
function Bootstrap () {
  const [error, setError] = useState<Error | null>(null);
  const [discord, setDiscord] = useState<Discord | null>(null);

  useEffect(() => {
    initDiscord().then((client) => {
      setDiscord(client);
    }).catch((err) => {
      setError(err instanceof Error ? err : new Error(String(err)));
    });
  }, []);

  if (error) return <ErrorScreen error={error} onRetry={() => window.location.reload()} />;
  if (!discord) return <LoadingScreen />;

  return <App />;
}

createRoot(app).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Bootstrap />
    </ThemeProvider>
  </React.StrictMode>
);
