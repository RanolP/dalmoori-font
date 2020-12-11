import React from 'react';
import ReactDOM from 'react-dom';
import { Global } from '@emotion/react';
import Base from 'styles/base';
import Reset from 'styles/reset';
import Pixelate from 'styles/pixelate';
import Typography from 'styles/typography';
import App from 'App';
import AppThemeProvider from 'system/AppThemeProvider';

// we know that there *must* exists the root element.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = document.getElementById('root')!;

ReactDOM.unstable_createRoot(root).render(
  <React.StrictMode>
    <AppThemeProvider>
      <Global styles={[Reset, Pixelate, Typography, Base]} />
      <App />
    </AppThemeProvider>
  </React.StrictMode>
);

