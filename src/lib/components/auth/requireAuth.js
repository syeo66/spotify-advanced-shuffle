import React, { memo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';

import { getToken } from '../../actions';

const requireAuth = (ComposedComponent) => {
  const Authentication = (props) => {
    const { data: authenticated, isLoading } = useQuery('token', getToken);
    const navigate = useNavigate();

    useEffect(() => {
      if (isLoading) {
        return;
      }

      if (!authenticated) {
        navigate('/');
      }
    }, [authenticated, navigate, isLoading]);

    if (authenticated) {
      return <ComposedComponent {...{ ...props, authenticated }} />;
    }

    return null;
  };

  return memo(Authentication);
};

export default requireAuth;
