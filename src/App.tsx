import React, { ReactElement, Suspense } from 'react';
import { styled } from 'lib/emotion';

import AppLocalizationProvider from 'system/AppLocalizationProvider';
import Navbar from 'system/Navbar';
import Loading from 'system/Loading';
import AppThemeProvider from 'system/AppThemeProvider';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LandingPage from 'pages/Landing';

const Wrap = styled.div`
  padding: 0 48px;

  max-width: 100vw;
  min-height: 100vh;

  background: ${({ theme }) => theme.background.darker};
  color: ${({ theme }) => theme.foreground.normal};

  h1, h2, h3, h4, h5, h6, strong, b {
    color: ${({ theme }) => theme.foreground.strong};
  }
`;

function App(): ReactElement {
  return (
    <AppThemeProvider>
      <Wrap>
        <Suspense fallback={<Loading />}>
          <AppLocalizationProvider name="app">
            <BrowserRouter basename={process.env.PUBLIC_URL}>
              <>
                <Navbar />
                <Switch>
                  <Route to="/" exact={true}>
                    <LandingPage />
                  </Route>
                </Switch>
              </>
            </BrowserRouter>
          </AppLocalizationProvider>
        </Suspense>
      </Wrap>
    </AppThemeProvider>
  );
}

export default App;
