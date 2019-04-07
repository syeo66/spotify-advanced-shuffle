import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

export default ComposedComponent => {
  const Authentication = props => {
    useEffect(() => {
      if (!props.authenticated) {
        props.history.push('/');
      }
    }, [props.authenticated]);

    if (props.authenticated) {
      return <ComposedComponent {...props} />;
    }
    return null;
  };

  Authentication.propTypes = {
    authenticated: PropTypes.string.isRequired,
    history: ReactRouterPropTypes.history.isRequired
  };

  const mapStateToProps = ({ auth }) => {
    return { authenticated: auth };
  };

  return connect(mapStateToProps)(Authentication);
};
