import { useState, useEffect } from 'react';

export type ColorScheme = 'dark' | 'light';
export const ColorSchemeList = ['dark', 'light'];
export const colorSchemes: Record<ColorScheme, string> = {
  'dark': '(prefers-color-scheme: dark)',
  'light': '(prefers-color-scheme: light)'
};

export default function usePreferredColorScheme(): ColorScheme | null {
  const [scheme, setScheme] = useState<ColorScheme | null>(null);

  useEffect(() => {
    if (!('matchMedia' in window)) {
      return;
    }

    // Add listener for all themes
    const cleanupFunctions: Array<() => void> = [];
    for (const [schemeName, query] of Object.entries(colorSchemes)) {
      const update = (matches: boolean) => {
        if (matches) {
          setScheme(schemeName as ColorScheme);
        }
      };

      const mq = window.matchMedia(query);
      const listener = (e: MediaQueryListEvent) => update(e.matches);
      mq.addEventListener('change', listener);
      update(mq.matches);

      cleanupFunctions.push(() => mq.removeEventListener('change', listener));
    }

    // Remove listeners, no memory leaks
    return () => {
      for (const cleanup of cleanupFunctions) {
        cleanup();
      }
    };
  }, []);

  return scheme;
}
