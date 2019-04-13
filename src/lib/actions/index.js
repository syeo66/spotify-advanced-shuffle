import {
  DB_COUNT,
  FETCH_LIBRARY,
  FETCH_PLAYER,
  FETCH_USER,
  FIRST_PAGE,
  LOAD_LIBRARY_PAGE,
  NEXT_PAGE,
  PREVIOUS_PAGE,
  RETRIEVE_AUTH_TOKEN,
  ADD_TO_LOAD_QUEUE,
  APPEND_PLAYLISTS,
  CHECKED_PLAYLISTS,
  FETCH_PLAYLISTS,
  TOGGLE_PLAYLIST,
  FETCH_PLAY_STATE,
  TOGGLE_CONFIG,
  UPDATE_CONFIG,
} from './types';
import db from '../database';

export const fetchUser = () => dispatch => {
  for (const entry of window.location.hash.substr(1).split('&')) {
    const splitEntry = entry.split('=');
    if (splitEntry[0] == 'access_token') {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'access_token',
            token: splitEntry[1],
          },
          '*'
        );
        window.close();
      }
    }
  }
};

export const doLogin = token => dispatch => {
  if (typeof Storage !== 'undefined') {
    window.localStorage.setItem('access_token', token);
  }
  dispatch({
    type: RETRIEVE_AUTH_TOKEN,
    payload: token,
  });
};

export const signInWithSpotify = e => dispatch => {
  e.preventDefault();
  const appUrl = encodeURIComponent(window.location.href.split('#')[0]);
  const scopes =
    'user-library-read playlist-read-private playlist-modify-private user-modify-playback-state user-read-playback-state';
  const url =
    'https://accounts.spotify.com/authorize?client_id=' +
    process.env.CLIENT_ID +
    '&redirect_uri=' +
    appUrl +
    '&response_type=token' +
    '&scope=' +
    encodeURIComponent(scopes);
  window.open(url, 'spotify', 'width=400, height=500');
};

export const signOut = e => dispatch => {
  e.preventDefault();
  doSignOut(dispatch);
};

const doSignOut = dispatch => {
  if (typeof Storage !== 'undefined') {
    window.localStorage.removeItem('access_token');
  }
  dispatch({
    type: RETRIEVE_AUTH_TOKEN,
    payload: null,
  });
};

export const retrieveUserData = authenticated => dispatch => {
  fetch('https://api.spotify.com/v1/me', {
    method: 'get',
    headers: new Headers({
      Authorization: 'Bearer ' + authenticated,
    }),
  })
    .then(response => {
      if (!response.ok) {
        if (response.status == 401) {
          doSignOut(dispatch);
        }
        return;
      }
      return response.json();
    })
    .then(response => {
      dispatch({
        type: FETCH_USER,
        user: response,
      });
    });
};

export const loadLibraryFromDb = (offset, limit) => dispatch => {
  db.tracks
    .orderBy('name')
    .offset(offset)
    .limit(limit)
    .toArray()
    .then(results => {
      dispatch({
        type: LOAD_LIBRARY_PAGE,
        payload: results,
      });
    });
};

export const markDb = _ => dispatch => {
  db.tracks.toCollection().modify(track => {
    track.isSynced = 0;
  });
};

export const doPurgeDb = _ => dispatch => {
  db.tracks
    .where('isSynced')
    .equals(0)
    .delete()
    .then(count => console.log('Purged ' + count + ' entries.'));
};

export const addToLoadQueue = (url, purge = false) => dispatch => {
  dispatch({
    type: ADD_TO_LOAD_QUEUE,
    payload: url,
    purge: purge,
  });
};

export const retrieveLibrary = (authenticated, queue) => dispatch => {
  const { url } = queue;
  fetch(url, {
    method: 'get',
    headers: new Headers({
      Authorization: 'Bearer ' + authenticated,
    }),
  })
    .then(response => response.json())
    .then(response => {
      let objects = [];
      for (const item of response.items) {
        const track = item.track;
        const itemObject = {
          id: track.id,
          uri: track.uri,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          image: track.album.images[0].url,
          duration_ms: track.duration_ms,
          isSynced: 1,
        };
        objects.push(itemObject);
      }
      db.tracks.bulkPut(objects);
      db.tracks.count().then(count => {
        dispatch({
          type: DB_COUNT,
          payload: {
            dbSize: count,
          },
        });
      });
      dispatch({
        type: FETCH_LIBRARY,
        payload: {
          ...queue,
          current: response.items.length + response.offset,
          size: response.total,
          next: response.next,
        },
      });
    });
};

export const firstPage = () => dispatch => {
  dispatch({
    type: FIRST_PAGE,
  });
};

export const previousPage = () => dispatch => {
  dispatch({
    type: PREVIOUS_PAGE,
  });
};

export const nextPage = () => dispatch => {
  dispatch({
    type: NEXT_PAGE,
  });
};

export const retrievePlaylists = (
  authenticated,
  url = 'https://api.spotify.com/v1/me/playlists?limit=50',
  append = false
) => dispatch => {
  fetch(url, {
    method: 'get',
    headers: new Headers({
      Authorization: 'Bearer ' + authenticated,
    }),
  })
    .then(response => response.json())
    .then(response => {
      if (response.next && response.total > response.offset + response.limit) {
        retrievePlaylists(authenticated, response.next, true)(dispatch);
      }
      dispatch({
        type: append ? APPEND_PLAYLISTS : FETCH_PLAYLISTS,
        payload: response,
      });
    });
};

export const togglePlaylist = (id, userId) => dispatch => {
  dispatch({
    type: TOGGLE_PLAYLIST,
    payload: { id, userId },
  });
};

export const setCheckedPlaylists = checked => dispatch => {
  dispatch({
    type: CHECKED_PLAYLISTS,
    payload: checked,
  });
};

export const retrievePlayerInfo = authenticated => dispatch => {
  fetch('https://api.spotify.com/v1/me/player/devices', {
    method: 'get',
    headers: new Headers({
      Authorization: 'Bearer ' + authenticated,
    }),
  })
    .then(response => response.json())
    .then(response => {
      dispatch({
        type: FETCH_PLAYER,
        devices: response,
      });
    });
};

export const retrievePlayState = authenticated => dispatch => {
  fetch('https://api.spotify.com/v1/me/player', {
    method: 'get',
    headers: new Headers({
      Authorization: 'Bearer ' + authenticated,
    }),
  })
    .then(response => {
      if (!response.ok || response.status !== 200) {
        if (response.status == 401) {
          doSignOut(dispatch);
        }
        return;
      }
      return response.json();
    })
    .then(response => {
      dispatch({
        type: FETCH_PLAY_STATE,
        playstate: response,
      });
    });
};

export const toggleConfig = () => dispatch => {
  dispatch({
    type: TOGGLE_CONFIG,
  });
};

export const setConfig = (key, value) => dispatch => {
  dispatch({
    type: UPDATE_CONFIG,
    config: {
      [key]: value,
    },
  });
};
