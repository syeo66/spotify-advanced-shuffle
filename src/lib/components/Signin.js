import React, { useEffect } from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';
import { useQuery } from 'react-query';

import { signInWithSpotify, getToken } from '../actions';

const Signin = ({ history }) => {
  const { data: auth } = useQuery('token', getToken());

  useEffect(() => {
    if (auth) {
      history.push('/app');
    }
  }, [auth, history]);

  return (
    <>
      <div className="row justify-content-center py-5">
        <div className="col-auto py-5 shadow border rounded">
          <a href="#" className="btn btn-success" onClick={signInWithSpotify}>
            <i className="fab fa-spotify" />
            &nbsp;Sign In With Spotify
          </a>
        </div>
      </div>
      <div className="row justify-content-center text-muted">
        <div className="col-auto">
          This website is communicating with the Spotify API only. It never sends or stores any data to its own server.
        </div>
      </div>
    </>
  );
};

Signin.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

export default Signin;
