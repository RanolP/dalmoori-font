import { css } from '@emotion/core';
import { Localized, useLocalization } from '@fluent/react';
import { styled } from 'lib/emotion';
import { ColorScheme, ColorSchemeList } from 'lib/hooks/use-preferred-color-scheme';
import { LocaleNameMap, SupportedLocale } from 'lib/localization';
import React, { ReactElement, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { SetUserLocalesContext } from 'system/AppLocalizationProvider';
import { SetUserColorSchemeContext } from 'system/AppThemeProvider';
import Icon from 'system/Icon';

export const NavbarHeight = '64px';

const Header = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${NavbarHeight};
`;

const BrandNavLink = styled(NavLink)`
  font-size: 32px;

  margin-right: 16px;

  text-decoration: none;
  color: ${({ theme }) => theme.foreground.strong};
`;

const Collapse = styled.div`
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-gap: 8px;
  margin-right: auto;
`;

const OtherNavLink = styled(NavLink)`
  text-decoration: none;
  color: ${({ theme }) => theme.foreground.normal};
`;

function Navbar(): ReactElement {
  const setUserColorScheme = useContext(SetUserColorSchemeContext);
  const setUserLocales = useContext(SetUserLocalesContext);
  const localization = useLocalization().l10n;

  return (
    <Header>
      <BrandNavLink to="/">
        <Icon name="logo-circle" css={css`margin: 4px 0;`} />
        <Localized id="brand">
          달무리
        </Localized>
      </BrandNavLink>
      <Collapse>
        <OtherNavLink to="/code">
          Code
        </OtherNavLink>
        <OtherNavLink to="/pro">
          Pro
        </OtherNavLink>
        <OtherNavLink to="/max">
          Max
        </OtherNavLink>
        <OtherNavLink to="/blog">
          Blog
        </OtherNavLink>
      </Collapse>
      <div>
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
      </div>
    </Header>
  );
}

export default Navbar;
