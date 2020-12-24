import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { retrievePlayerInfo } from '../actions';
import PropTypes from 'prop-types';
import axios from 'axios';

const PlayerInfo = (props) => {
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    props.retrievePlayerInfo(props.authenticated, signal);
    const polling = setInterval(() => props.retrievePlayerInfo(props.authenticated, signal), 3000);
    return () => {
      clearInterval(polling);
      controller.abort();
    };
  }, []);

  if (!props.devices || !props.devices.length) {
    return (
      <div className="alert alert-danger my-3 shadow" role="alert">
        Sorry, could not find any devices! Please make sure Spotify is running.
      </div>
    );
  }

  const devices = props.devices
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
  retrievePlayerInfo: PropTypes.func.isRequired,
  authenticated: PropTypes.string,
  devices: PropTypes.array.isRequired,
};

function mapStateToProps({ auth, data }) {
  return {
    authenticated: auth,
    devices: data.devices ? data.devices : [],
  };
}

export default connect(mapStateToProps, { retrievePlayerInfo })(PlayerInfo);
