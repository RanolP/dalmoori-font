import { css } from '@emotion/react';

const Style = css`
  @font-face {
      font-family: 'dalmoori';
      src: url('${process.env.PUBLIC_URL}/legacy/dalmoori.ttf') format('truetype');
  }

  html {
    font-size: 16px;
  }
  html, select, textarea {
    font-family: dalmoori;
  }
`;

export const KeepAll = css`
  html {
    word-break: keep-all;
  }
`;

export default Style;
