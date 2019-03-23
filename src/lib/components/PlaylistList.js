import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  addToLoadQueue,
  setCheckedPlaylists,
  retrievePlaylists,
  setConfig,
  togglePlaylist,
} from '../actions';

const PlaylistList = props => {
  useEffect(() => {
    props.retrievePlaylists(props.authenticated);
    const polling = setInterval(_ => props.retrievePlaylists(props.authenticated), 4900);
    return () => clearInterval(polling);
  }, []);

  useEffect(() => {
    if (!props.userId) {
      return;
    }
    if (typeof(Storage) !== "undefined") {
      const userId = props.userId;
      const key = 'checkedPlaylists';
      const rawValue = window.localStorage.getItem(userId + '.' + key);
      const value = rawValue ? JSON.parse(rawValue) : [];
      props.setCheckedPlaylists(value);
    }
  }, [props.userId]);

  useEffect(() => {
    props.checkedPlaylists.map(id => {
      addToQueue(id);
    });
  }, [props.checkedPlaylists]);

  const addToQueue = id => {
    const myUrl = 'https://api.spotify.com/v1/playlists/' + id + '/tracks';
    const found = props.loadQueue.filter(entry => entry.origUrl === myUrl);
    if (found.length === 0) {
      props.addToLoadQueue(myUrl);
    }
  };

  const handleClick = (e) => {
    props.togglePlaylist(e.target.value, props.userId);
  };

  const playlists = props.playlists
    .sort((a,b) => {return a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1})
    .map(entry => {
      return (
        <li className="list-group-item d-flex justify-start align-items-center" key={entry.id}>
          <input
            type="checkbox"
            checked={props.checkedPlaylists.indexOf(entry.id) !== -1
              && !(entry.name === props.configRandomListName)}
            value={entry.id}
            onChange={handleClick}
            disabled={entry.name === props.configRandomListName}
            />
          <span className="ml-3 text-left">{entry.name}</span>
          <span className="badge badge-primary badge-pill ml-auto">{entry.tracks.total}</span>
        </li>
      );
    });

  return (
    <ul className="list-group my-3 shadow rounded">
      {playlists}
    </ul>
  );
}

function mapStateToProps({auth, data}) {
  return {
    authenticated: auth,
    playlists: data.playlists ? data.playlists : [],
    userId: data.user ? data.user.id : null,
    checkedPlaylists: data.checkedPlaylists,
    configRandomListName: data.config ? data.config.randomListName : null,
    loadQueue: data.loadQueue,
  }
}

export default connect(mapStateToProps, {
  addToLoadQueue,
  setCheckedPlaylists,
  retrievePlaylists,
  setConfig,
  togglePlaylist,
})(PlaylistList);
