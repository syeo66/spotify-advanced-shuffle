import React, { lazy, Suspense, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchUser, doLogin } from './actions';

const Overview = lazy(() => import('./components/Overview'));

import Signin from './components/Signin';
import Signout from './components/Signout';
import requireAuth from './components/auth/requireAuth';
import db from './database';
import axios from 'axios';
import retry from 'axios-retry-after';

axios.interceptors.response.use(null, retry(axios));

const App = (props) => {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  useEffect(() => {
    db.open().then(() => setIsDatabaseReady(true));

    const onMessage = (message) =>
      message.data.type && message.data.type == 'access_token' ? props.doLogin(message.data.token) : null;

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
  doLogin: PropTypes.func.isRequired,
  fetchUser: PropTypes.func.isRequired,
};

export default connect(null, { fetchUser, doLogin })(App);
