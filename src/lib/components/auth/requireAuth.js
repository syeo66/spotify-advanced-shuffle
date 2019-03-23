import React, { useEffect } from 'react';
import { connect } from 'react-redux';

export default (ComposedComponent) => {
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
  }

  const mapStateToProps = ({auth}) => {
      return { authenticated: auth };
  }

  return connect(mapStateToProps)(Authentication);
}
