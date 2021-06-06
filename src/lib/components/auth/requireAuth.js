import React, { memo, useEffect } from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';
import { useQuery } from 'react-query';

import { getToken } from '../../actions';

export default (ComposedComponent) => {
  const Authentication = (props) => {
    const { history } = props;
    const { data: authenticated, isLoading } = useQuery('token', getToken);

    useEffect(() => {
      if (isLoading) {
        return;
      }

      if (!authenticated) {
        history.push('/');
      }
    }, [authenticated, history, isLoading]);

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
