import React, { memo } from 'react';
import { signOut, getToken } from '../actions';

const Signout = () => {
  if (!getToken()) {
    return '';
  }

  return (
    <a href="#" className="btn btn-primary btn-sm" onClick={signOut}>
      <i className="fas fa-sign-out-alt" />
      &nbsp;Signout
    </a>
  );
};

export default memo(Signout);
