import { css, SerializedStyles, Theme } from '@emotion/react';

const Style = (theme: Theme): SerializedStyles => css`
  a { 
    color: ${theme.link.normal};
  }
  a:visited { 
    color: ${theme.link.visit};
  }
`;

export default Style;
