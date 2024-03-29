import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { getToken, signInWithSpotify } from '../actions';

const Signin = () => {
  const { data: auth } = useQuery('token', getToken());
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) {
      navigate('/app');
    }
  }, [auth, navigate]);

  return (
    <>
      <div className="row justify-content-center py-5">
        <div className="col-auto py-5 shadow border rounded">
          <SpotifyButton className="btn btn-success" onClick={signInWithSpotify}>
            <i className="fab fa-spotify" />
            &nbsp;Sign In With Spotify
          </SpotifyButton>
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

const SpotifyButton = styled.button`
  background-color: #1db954;
  border-color: #1db954;
  color: white;
  font-size: 22px;

  & > i {
    margin-right: 11px;
  }
`;

export default Signin;
