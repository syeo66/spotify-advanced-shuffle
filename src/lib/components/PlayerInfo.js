import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useQuery } from 'react-query';

import { retrievePlayerInfo } from '../actions';

const PlayerInfo = (props) => {
  const { data, isLoading, isError } = useQuery('playerinfo', retrievePlayerInfo(props.authenticated), {
    refetchInterval: 3000,
  });

  if (isLoading) {
    return <div className="my-3 border shadow rounded p-3">Loading...</div>;
  }

  if (!data?.devices?.length || isError) {
    return (
      <div className="alert alert-danger my-3 shadow" role="alert">
        Sorry, could not find any devices! Please make sure Spotify is running.
      </div>
    );
  }

  const devices = data.devices
    .sort((a, b) => {
      return a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1;
    })
    .map((entry) => {
      const classe = 'list-group-item list-group-item-action';
      const activeClass = classe + (entry.is_active ? ' active' : '');

      const choosePlayer = () => {
        const id = entry.id;
        const authenticated = props.authenticated;
        const url = 'https://api.spotify.com/v1/me/player';

        // TODO: use mutations
        axios({
          url,
          method: 'put',
          headers: {
            Authorization: 'Bearer ' + authenticated,
          },
          data: {
            device_ids: [id],
          },
        }).then(() => props.retrievePlayerInfo(props.authenticated));
      };

      return (
        <a className={activeClass} href="#" onClick={choosePlayer} key={entry.id}>
          {entry.name}
        </a>
      );
    });

  return <div className="list-group my-3 shadow rounded">{devices}</div>;
};

PlayerInfo.propTypes = {
  authenticated: PropTypes.string,
};

function mapStateToProps({ auth }) {
  return {
    authenticated: auth,
  };
}

export default connect(mapStateToProps, {})(PlayerInfo);
