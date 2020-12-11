import { ColorTheme } from '../lib/theme';

declare module '@emotion/react' {

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme extends ColorTheme { }
}
