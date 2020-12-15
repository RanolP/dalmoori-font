import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export default function useLocalStorage<T>(key: string, fallbackValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(() => {
    if (key in localStorage) {
      try {
        return JSON.parse(localStorage[key]);
      } catch {
        /* do nothing */
      }
    }
    return fallbackValue;
  });

  useEffect(() => {
    localStorage[key] = JSON.stringify(state);
  }, [state]);

  return [state, setState];
}
