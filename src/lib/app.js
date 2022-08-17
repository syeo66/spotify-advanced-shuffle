import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as rax from 'retry-axios';
import styled from 'styled-components';

import { doLogin, fetchUser, getToken } from './actions';
import requireAuth from './components/auth/requireAuth';
import Signin from './components/Signin';
import Signout from './components/Signout';
import db from './database';

const Overview = lazy(() => import('./components/Overview'));

// axios.interceptors.response.use(null, retry(axios));
rax.attach();

const App = (props) => {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  const { fetchUser } = props;

  const queryClient = useQueryClient();
  const login = useMutation(doLogin, {
    onSuccess: () => {
      queryClient.setQueryData('token', () => getToken());
    },
  });

  useEffect(() => {
    db.open().then(() => setIsDatabaseReady(true));

    const onMessage = (message) => {
      return message.data.type && message.data.type === 'access_token' ? login.mutate(message.data.token) : null;
    };

    window.addEventListener('message', onMessage);
    fetchUser();

    return () => window.removeEventListener('message', onMessage);
  }, [fetchUser, login]);

  const Auth = requireAuth(Overview);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <HeaderLink className="navbar-brand mr-auto" href="/">
            <SpotifyIcon>
              <i className="fab fa-spotify" />
            </SpotifyIcon>
            Advanced Shuffle for Spotify
          </HeaderLink>
          <Signout />
        </div>
      </nav>
      {isDatabaseReady ? (
        <BrowserRouter>
          <div className="container-fluid">
            <Suspense fallback={<div />}>
              <Routes>
                <Route exact path="/" element={<Signin />} />
                <Route path="/app" element={<Auth />} />
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      ) : (
        'Waiting for Database...'
      )}
    </div>
  );
};

const SpotifyIcon = styled.p`
  display: inline-block;
  font-size: 22px;
  color: #1db954;
  margin: 0 11px 0 0;
`;
const HeaderLink = styled.a`
  white-space: nowrap;
`;

App.propTypes = {
  fetchUser: PropTypes.func.isRequired,
};

export default connect(null, { fetchUser })(App);
