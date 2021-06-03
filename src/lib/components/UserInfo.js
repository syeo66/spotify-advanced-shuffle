import React, { memo } from 'react';
import { connect } from 'react-redux';
import { useQuery } from 'react-query';

import { retrieveUserData } from '../actions';

const UserInfo = (props) => {
  const { data, isLoading, isError } = useQuery('userinfo', retrieveUserData);

  if (isError) {
    return <div className="my-3 border shadow rounded p-3">Could not load user data.</div>;
  }

  return (
    <div className="my-3 border shadow rounded p-3">
      {!isLoading && data ? (
        <div className="row">
          <div className="col-3 m-0 pr-0">
            <img className="img-thumbnail" src={data.images[0].url} />
          </div>
          <div className="col pt-0 pb-0 pl-2 mt-n1">
            <small>{data.display_name}</small>
            <br />
          </div>
        </div>
      ) : (
        <>Loading...</>
      )}
    </div>
  );
};

const mapStateToProps = ({}) => {
  return {};
};

export default connect(mapStateToProps, { retrieveUserData })(memo(UserInfo));
