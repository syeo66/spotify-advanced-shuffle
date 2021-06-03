import React, { memo, useCallback, useEffect, useState } from 'react';
import { signOut, getToken } from '../actions';

const Signout = () => {
  const [auth, setAuth] = useState(getToken());

  useEffect(() => {
    const interval = setInterval(() => {
      const token = getToken();
      if (token !== auth) {
        setAuth(token);
      }
    }, 5000);
    return () => learInterval(interval);
  }, []);

  const handleSignout = useCallback(() => {
    setAuth(null);
    signOut();
  }, []);

  if (!auth) {
    return '';
  }

  return (
    <a href="#" className="btn btn-primary btn-sm" onClick={handleSignout}>
      <i className="fas fa-sign-out-alt" />
      &nbsp;Signout
    </a>
  );
};

export default memo(Signout);
