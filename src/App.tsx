import React, { ReactElement, Suspense } from 'react';
import styled from '@emotion/styled';

import AppLocalizationProvider from 'system/AppLocalizationProvider';
import Navbar from 'system/Navbar';
import Loading from 'system/Loading';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LandingPage from 'pages/Landing';

const Wrap = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  background: ${({ theme }) => theme.background.normal};
  color: ${({ theme }) => theme.foreground.normal};

  h1, h2, h3, h4, h5, h6, strong, b {
    color: ${({ theme }) => theme.foreground.strong};
  }
`;

function App(): ReactElement {
  return (
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
  );
}

export default App;
