import React, { memo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import ReactRouterPropTypes from 'react-router-prop-types';

import { getToken } from '../../actions';

export default (ComposedComponent) => {
  const Authentication = (props) => {
    const { data: authenticated, isLoading } = useQuery('token', getToken);

    useEffect(() => {
      if (isLoading) {
        return;
      }
      if (!authenticated) {
        props.history.push('/');
      }
    }, [authenticated, isLoading]);

    if (authenticated) {
      return <ComposedComponent {...{ ...props, authenticated }} />;
    }

    return null;
  };

  Authentication.propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
  };

  return memo(Authentication);
};
