import axios from 'axios';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import retry from 'axios-retry-after';
import { useMutation, useQueryClient } from 'react-query';

import db from './database';
import { fetchUser, doLogin, getToken } from './actions';
import requireAuth from './components/auth/requireAuth';
import Signin from './components/Signin';
import Signout from './components/Signout';

const Overview = lazy(() => import('./components/Overview'));

axios.interceptors.response.use(null, retry(axios));

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
      message.data.type && message.data.type == 'access_token' ? login.mutate(message.data.token) : null;
    };

    window.addEventListener('message', onMessage);
    fetchUser();

    return () => window.removeEventListener('message', onMessage);
  }, [fetchUser, login]);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand mr-auto" href="#">
          Spotify Advanced Shuffle
        </a>
        <Signout />
      </nav>
      {isDatabaseReady ? (
        <BrowserRouter>
          <div className="container-fluid">
            <Route exact path="/" component={Signin} />
            <Suspense fallback={<div />}>
              <Route path="/app" component={requireAuth(Overview)} />
            </Suspense>
          </div>
        </BrowserRouter>
      ) : (
        'Waiting for Database...'
      )}
    </div>
  );
};

App.propTypes = {
  fetchUser: PropTypes.func.isRequired,
};

export default connect(null, { fetchUser })(App);
