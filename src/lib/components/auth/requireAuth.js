import React, { useEffect } from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';

import { getToken } from '../../actions';

export default (ComposedComponent) => {
  const Authentication = (props) => {
    const authenticated = getToken();

    useEffect(() => {
      if (!authenticated) {
        props.history.push('/');
      }
    }, [authenticated]);

    if (authenticated) {
      return <ComposedComponent {...{ ...props, authenticated }} />;
    }
    return null;
  };

  Authentication.propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
  };

  return Authentication;
};
