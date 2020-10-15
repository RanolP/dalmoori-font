import { css } from '@emotion/core';
import { Localized, useLocalization } from '@fluent/react';
import { styled } from 'lib/emotion';
import { ColorScheme, ColorSchemeList } from 'lib/hooks/use-preferred-color-scheme';
import { LocaleNameMap, SupportedLocale } from 'lib/localization';
import React, { ReactElement, useContext } from 'react';
import { SetUserLocalesContext } from 'system/AppLocalizationProvider';
import { SetUserColorSchemeContext } from 'system/AppThemeProvider';
import Select from 'react-select/src/Select';
import Icon from 'system/Icon';

const Header = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

function Navbar(): ReactElement {
  const setUserColorScheme = useContext(SetUserColorSchemeContext);
  const setUserLocales = useContext(SetUserLocalesContext);
  const localization = useLocalization().l10n;

  return (
    <Header>
      <h1>
        <Icon name="logo-circle" css={css`margin: 4px 0;`} />
        <Localized id="brand">
          달무리
        </Localized>
      </h1>
      Code
      Pro
      Max
      블로그
      <select
        onChange={(event): void => { setUserColorScheme?.(event.target.value === '$default' ? null : event.target.value as ColorScheme); }}
      >
        <option value="$default">
          {localization.getString('theme-system-default')}
        </option>
        {ColorSchemeList.map(schemeName => (
          <option key={schemeName} value={schemeName}>
            {localization.getString(`theme-${schemeName}`)}
          </option>
        ))}
      </select>
      <select onChange={(event): void => { setUserLocales?.([event.target.value as SupportedLocale]); }}>
        {Object.entries(LocaleNameMap).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </Header>
  );
}

export default Navbar;
