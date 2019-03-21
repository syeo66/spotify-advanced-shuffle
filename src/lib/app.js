import React, { lazy, Suspense, useEffect } from 'react';

import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchUser, doLogin } from './actions';

const Overview = lazy(() => import("./components/Overview"));

import Signin from "./components/Signin";
import Signout from "./components/Signout";
import requireAuth from "./components/auth/requireAuth";

const App = props => {
  useEffect(() => {
    const onMessage = message => {
      if (message.data.type && message.data.type == 'access_token') {
        props.doLogin(message.data.token);
      }
    }

    window.addEventListener("message", onMessage);
    props.fetchUser();

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand mr-auto" href="#">Spotify Advanced Shuffle</a>
        <Signout />
      </nav>
      <BrowserRouter>

          <div className="container-fluid">
            <Route exact path="/" component={Signin} />
            <Suspense fallback={(<div />)}>
              <Route path="/app" component={requireAuth(Overview)} />
            </Suspense>
          </div>
      </BrowserRouter>
    </div>
  );
}

export default connect(null, { fetchUser, doLogin })(App);
