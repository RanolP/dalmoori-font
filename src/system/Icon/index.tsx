import React, { ImgHTMLAttributes, ReactElement } from 'react';
import styled from '@emotion/styled';

export type HtmlImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;
export interface IconProps extends HtmlImageProps {
  name: 'logo' | 'logo-circle' | 'github';
}

const IconImage = styled.img`
  display: inline-block;
  height: 1em;
  vertical-align: middle;
`;

const Icon = ({ name, ...props }: IconProps): ReactElement => {
  let src: string;
  switch (name) {
    case 'logo': {
      src = process.env.PUBLIC_URL + '/images/logo.svg';
      break;
    }
    case 'logo-circle': {
      src = process.env.PUBLIC_URL + '/images/logo-circle.svg';
      break;
    }
    case 'github': {
      src = process.env.PUBLIC_URL + '/images/github.svg';
      break;
    }
  }
  return <IconImage src={src} {...props} />;
};

export default Icon;
