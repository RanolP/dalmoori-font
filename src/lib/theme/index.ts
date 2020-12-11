import nord from 'styles/nord';

export type Color = string;
export interface ColorVariant {
  weak: Color;
  normal: Color;
  strong: Color;
  brighter: Color;
  darker: Color;
}

export interface ColorTheme {
  isDark: boolean;
  background: ColorVariant;
  foreground: ColorVariant;
  link: {
    normal: Color;
    visit: Color;
  };
}

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
  isDark: true,
  background: BlackVariant,
  foreground: WhiteVariant,
  link: {
    normal: nord[8],
    visit: nord[15],
  },
};

export const LightTheme: ColorTheme = {
  isDark: false,
  background: WhiteVariant,
  foreground: BlackVariant,
  link: {
    normal: nord[10],
    visit: nord[15],
  },
};
