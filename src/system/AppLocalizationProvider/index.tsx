import React, { useState, ReactNode, ReactElement, createContext, Dispatch, SetStateAction, unstable_useTransition as useTransition } from 'react';

import { ReactLocalization, LocalizationProvider as FluentProvider } from '@fluent/react';
import useSWR from 'swr';
import { SupportedLocale, negotiateLanguages, fetchMessages, lazilyParsedBundles } from 'lib/localization';

export interface LocalizationProviderProps {
  children: ReactNode;
}

export const SetUserLocalesContext = createContext<Dispatch<SetStateAction<SupportedLocale[]>> | undefined>(undefined);
export const IsUserLocaleUpdatingContext = createContext<boolean>(false);

export default function AppLocalizationProvider({ children }: LocalizationProviderProps): ReactElement {
  const [userLocales, setUserLocalesRaw] = useState(navigator.languages as SupportedLocale[]);
  const [startTransition, isPending] = useTransition({ timeoutMs: 3000 });
  const setUserLocales: Dispatch<SetStateAction<SupportedLocale[]>> = v => startTransition(() => setUserLocalesRaw(v));
  // we know that swr *must* fetch the resource
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const l10n = useSWR(
    'l10n[' + userLocales.join(',') + ']',
    async (): Promise<ReactLocalization> => {
      const currentLocales = negotiateLanguages(userLocales);
      const fetchedMessages = await Promise.all(currentLocales.map(fetchMessages));
      const bundles = lazilyParsedBundles(fetchedMessages);
      return new ReactLocalization(bundles);
    },
    { suspense: true }
  ).data!;

  return (
    <FluentProvider l10n={l10n}>
      <SetUserLocalesContext.Provider value={setUserLocales}>
        <IsUserLocaleUpdatingContext.Provider value={isPending}>
          {children}
        </IsUserLocaleUpdatingContext.Provider>
      </SetUserLocalesContext.Provider>
    </FluentProvider>
  );
}
