import React, { ReactNode, ReactElement, createContext, SetStateAction, Dispatch } from 'react';
import usePreferredColorScheme, { ColorScheme } from 'lib/hooks/use-preferred-color-scheme';
import { ThemeProvider } from '@emotion/react';
import { ColorTheme, DarkTheme, LightTheme } from 'lib/theme';
import useLocalStorage from 'lib/hooks/use-local-storage';

export interface AppThemeProviderProps {
  children: ReactNode;
}

export const SetUserColorSchemeContext = createContext<Dispatch<SetStateAction<ColorScheme | null>> | undefined>(undefined);

export default function AppThemeProvider({ children }: AppThemeProviderProps): ReactElement {
  const preferredColorScheme = usePreferredColorScheme();
  const [userColorScheme, setUserColorScheme] = useLocalStorage<ColorScheme | null>('colorTheme', null);
  let theme: ColorTheme;
  switch (userColorScheme ?? preferredColorScheme) {
    case 'dark':
    default:
      theme = DarkTheme;
      break;
    case 'light':
      theme = LightTheme;
      break;
  }

  return (
    <SetUserColorSchemeContext.Provider value={setUserColorScheme}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </SetUserColorSchemeContext.Provider>
  );
}
