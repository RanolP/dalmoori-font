import nord from 'styles/nord';
import styledRaw, { CreateStyled } from '@emotion/styled';

export type Color = string;
export interface ColorVariant {
  weak: Color;
  normal: Color;
  strong: Color;
  brighter: Color;
  darker: Color;
};

export interface ColorTheme {
  background: ColorVariant;
  foreground: ColorVariant;
}

export const styled = styledRaw as CreateStyled<ColorTheme>;

const BlackVariant: ColorVariant = {
  brighter: nord[2],
  weak: nord[2],
  normal: nord[1],
  darker: nord[0],
  strong: nord[0],
};

const WhiteVariant: ColorVariant = {
  weak: nord[4],
  darker: nord[4],
  normal: nord[5],
  brighter: nord[6],
  strong: nord[6],
};

export const DarkTheme: ColorTheme = {
  background: BlackVariant,
  foreground: WhiteVariant,
};

export const LightTheme: ColorTheme = {
  background: WhiteVariant,
  foreground: BlackVariant,
};
