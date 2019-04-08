import React, { memo, useEffect } from 'react';
import { connect } from 'react-redux';
import { retrieveUserData } from '../actions';
import PropTypes from 'prop-types';

const UserInfo = props => {
  useEffect(() => props.retrieveUserData(props.authenticated), []);

  return (
    <div className="my-3 border shadow rounded p-3">
      {props.user ? (
        <div className="row">
          <div className="col-3 m-0 pr-0">
            <img className="img-thumbnail" src={props.user.images[0].url} />
          </div>
          <div className="col pt-0 pb-0 pl-2 mt-n1">
            <small>{props.user.display_name}</small>
            <br />
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

UserInfo.propTypes = {
  retrieveUserData: PropTypes.func.isRequired,
  authenticated: PropTypes.string.isRequired,
  user: PropTypes.object,
};

const mapStateToProps = ({ data, auth }) => {
  return data.user
    ? {
        authenticated: auth,
        user: data.user,
      }
    : {
        authenticated: auth,
      };
};

export default connect(
  mapStateToProps,
  { retrieveUserData }
)(memo(UserInfo));
