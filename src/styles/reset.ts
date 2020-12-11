import { css } from '@emotion/react';

const Style = css`
  html, body {
    padding: 0;
    margin: 0;

    max-width: 100vw;
  }

  *, *::after, *::before {
    box-sizing: border-box;
  }

  html, body, #root {
    min-height: 100vh;
  }
`;

export default Style;
