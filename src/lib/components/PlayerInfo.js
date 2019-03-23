import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { retrievePlayerInfo } from '../actions';

const PlayerInfo = props => {
  useEffect(() => {
    props.retrievePlayerInfo(props.authenticated);
    const polling = setInterval(_ => props.retrievePlayerInfo(props.authenticated), 3000);
    return () => clearInterval(polling);
  }, []);

  if (!props.devices || !props.devices.length) {
    return (
      <div className="alert alert-danger my-3 shadow" role="alert">
        Sorry, could not find any devices! Please make sure Spotify is running.
      </div>
    );
  }

  const devices = props.devices
    .sort((a,b) => {return a.name.toUpperCase()<b.name.toUpperCase() ? -1 : 1})
    .map(entry => {
        const classe = "list-group-item list-group-item-action";
        const activeClass = classe + (entry.is_active ? " active" : "");

        const choosePlayer = _ => {
          const id = entry.id;
          const authenticated = props.authenticated;
          const url = "https://api.spotify.com/v1/me/player";

          fetch(url, {
              method: 'put',
              headers: new Headers({
                'Authorization': 'Bearer ' + authenticated
              }),
              body: JSON.stringify({
                device_ids: [id],
              })
            })
            .then(_ => props.retrievePlayerInfo(props.authenticated));
        }

        return (
          <a className={activeClass} href="#" onClick={choosePlayer} key={entry.id}>{entry.name}</a>
        );
      });

  return (
    <div className="list-group my-3 shadow rounded">{devices}</div>
  );
}

function mapStateToProps({ auth, data }) {
  return {
    authenticated: auth,
    devices: data.devices ? data.devices : [],
  };
}

export default connect(mapStateToProps, { retrievePlayerInfo })(PlayerInfo);
