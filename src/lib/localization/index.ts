import { FluentBundle, FluentResource } from '@fluent/bundle';
import { negotiateLanguages as fluentNegotiateLanguages } from '@fluent/langneg';

export const SupportedLocaleList = ['ko-KR', 'en-US'] as const;
export type SupportedLocale = typeof SupportedLocaleList[number];
export const LocaleNameMap: Record<SupportedLocale, string> = {
  'ko-KR': '한국어',
  'en-US': 'English (US)',
};
export const DefaultLocale: SupportedLocale = 'ko-KR';

function ftl(locale: SupportedLocale, name: string): string {
  return `${process.env.PUBLIC_URL}/l10n/${locale}/${name}.ftl`;
}

export async function fetchMessages(locale: SupportedLocale, name: string): Promise<[string, string]> {
  const response = await fetch(ftl(locale, name));
  const messages = await response.text();
  return [locale, messages];
}

export function* lazilyParsedBundles(fetchedMessages: Array<[string, string]>): Generator<FluentBundle, void, unknown> {
  for (const [locale, messages] of fetchedMessages) {
    const resource = new FluentResource(messages);
    const bundle = new FluentBundle(locale);
    bundle.addResource(resource);
    yield bundle;
  }
}

export function negotiateLanguages(userLocales: SupportedLocale[]): SupportedLocale[] {
  return fluentNegotiateLanguages(
    userLocales,
    SupportedLocaleList as unknown as string[],
    { defaultLocale: DefaultLocale }
  ) as SupportedLocale[];
}
