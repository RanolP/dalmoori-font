import React, { useState, ReactNode, ReactElement, createContext, Dispatch, SetStateAction, unstable_useTransition as useTransition, useMemo } from 'react';

import { ReactLocalization, LocalizationProvider as FluentProvider } from '@fluent/react';
import useSWR from 'swr';
import { SupportedLocale, negotiateLanguages, fetchMessages, lazilyParsedBundles } from 'lib/localization';
import { Global } from '@emotion/react';
import { KeepAll } from 'styles/typography';

export interface LocalizationProviderProps {
  name: string;
  children: ReactNode;
}

export const SetUserLocalesContext = createContext<Dispatch<SetStateAction<SupportedLocale[]>> | undefined>(undefined);
export const IsUserLocaleUpdatingContext = createContext<boolean>(false);

export default function AppLocalizationProvider({ name, children }: LocalizationProviderProps): ReactElement {
  const [userLocales, setUserLocalesRaw] = useState(navigator.languages as string[]);
  const [startTransition, isPending] = useTransition({ busyDelayMs: 3000 });
  const setUserLocales: Dispatch<SetStateAction<SupportedLocale[]>> = v => startTransition(() => setUserLocalesRaw(v as string[]));
  const isKorean = useMemo(() => {
    const currentLocales = negotiateLanguages(userLocales);
    return currentLocales.includes('ko-KR');
  }, [userLocales]);
  // we know that swr *must* fetch the resource
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const l10n = useSWR(
    'l10n[' + userLocales.join(',') + ']',
    async (): Promise<ReactLocalization> => {
      const currentLocales = negotiateLanguages(userLocales);
      const fetchedMessages = await Promise.all(currentLocales.map(locale => fetchMessages(locale, name)));
      const bundles = lazilyParsedBundles(fetchedMessages);
      return new ReactLocalization(bundles);
    },
    { suspense: true }
  ).data!;

  return (
    <FluentProvider l10n={l10n}>
      <>
        {isKorean && <Global styles={[KeepAll]} />}
        <SetUserLocalesContext.Provider value={setUserLocales}>
          <IsUserLocaleUpdatingContext.Provider value={isPending}>
            {children}
          </IsUserLocaleUpdatingContext.Provider>
        </SetUserLocalesContext.Provider>
      </>
    </FluentProvider>
  );
}
