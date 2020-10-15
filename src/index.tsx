import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './service-worker';
import { Global } from '@emotion/core';
import Reset from 'styles/reset';
import Pixelate from 'styles/pixelate';
import Typography from 'styles/typography';
import App from 'App';

ReactDOM.unstable_createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Global styles={[Reset, Pixelate, Typography]} />
    <App />
  </React.StrictMode>
);

serviceWorker.unregister();
