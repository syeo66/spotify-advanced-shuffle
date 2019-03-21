import React, { memo, useEffect } from 'react';
import { connect } from 'react-redux';
import { retrieveUserData } from '../actions';

const UserInfo = props => {
  useEffect(() => props.retrieveUserData(props.authenticated), []);

  return (
    <div className="my-3 border shadow rounded p-3">
      {props.user ? (
        <div className="row">
            <div className="col-3 m-0 pr-0"><img className="img-thumbnail" src={props.user.images[0].url} /></div>
            <div className="col pt-0 pb-0 pl-2 mt-n1">
                <small>{props.user.display_name}</small><br/>
            </div>
        </div>
      ) : (<div />)}
    </div>
  );
}

const mapStateToProps = state => {
    return state.data.user ? {
        authenticated: state.auth,
        user: state.data.user
    } : {
        authenticated: state.auth,
    }
}

export default connect(mapStateToProps, { retrieveUserData })(memo(UserInfo));
