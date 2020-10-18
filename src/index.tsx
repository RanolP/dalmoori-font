import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './service-worker';
import { Global } from '@emotion/core';
import Reset from 'styles/reset';
import Pixelate from 'styles/pixelate';
import Typography from 'styles/typography';
import App from 'App';

// we know that there *must* exists the root element.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = document.getElementById('root')!;

ReactDOM.unstable_createRoot(root).render(
  <React.StrictMode>
    <Global styles={[Reset, Pixelate, Typography]} />
    <App />
  </React.StrictMode>
);

serviceWorker.unregister();
