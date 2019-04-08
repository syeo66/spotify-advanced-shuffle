import React, { memo } from 'react';
import { connect } from 'react-redux';
import { signOut } from '../actions';
import PropTypes from 'prop-types';

const Signout = props => {
  if (!props.auth) {
    return '';
  }

  return (
    <a href="#" className="btn btn-primary btn-sm" onClick={props.signOut}>
      <i className="fas fa-sign-out-alt" />
      &nbsp;Signout
    </a>
  );
};

Signout.propTypes = {
  auth: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  signOut: PropTypes.func.isRequired,
};

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(
  mapStateToProps,
  { signOut }
)(memo(Signout));
