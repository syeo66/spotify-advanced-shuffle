import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import retry from 'axios-retry-after';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { useMutation, useQueryClient } from 'react-query';

import Signin from './components/Signin';
import Signout from './components/Signout';
import db from './database';
import requireAuth from './components/auth/requireAuth';
import { fetchUser, doLogin } from './actions';

const Overview = lazy(() => import('./components/Overview'));

axios.interceptors.response.use(null, retry(axios));

const App = (props) => {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  const queryClient = useQueryClient();
  const login = useMutation(doLogin, {
    onSuccess: () => {
      queryClient.invalidateQueries('token');
    },
  });

  useEffect(() => {
    db.open().then(() => setIsDatabaseReady(true));

    const onMessage = (message) =>
      message.data.type && message.data.type == 'access_token' ? login.mutate(message.data.token) : null;

    window.addEventListener('message', onMessage);
    props.fetchUser();

    return () => window.removeEventListener('message', onMessage);
  }, []);

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
