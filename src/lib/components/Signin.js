import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { signInWithSpotify, doLogin } from '../actions';

const Signin = props => {
  useEffect(() => {
    if (typeof Storage !== 'undefined') {
      const access_token = window.localStorage.getItem('access_token');
      if (access_token) {
        props.doLogin(access_token);
      }
    }
  }, []);

  useEffect(() => {
    if (props.auth) {
      props.history.push('/app');
    }
  }, [props.auth]);

  return (
    <div className="row justify-content-center py-5">
      <div className="col-auto py-5 shadow border rounded">
        <a href="#" className="btn btn-success" onClick={props.signInWithSpotify}>
          <i className="fab fa-spotify" />
          &nbsp;Sign In With Spotify
        </a>
      </div>
    </div>
  );
};

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(
  mapStateToProps,
  { signInWithSpotify, doLogin }
)(Signin);
