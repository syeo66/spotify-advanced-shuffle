import axios from 'axios';

import {
  DB_COUNT,
  FETCH_LIBRARY,
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
  TOGGLE_CONFIG,
  UPDATE_CONFIG,
  FETCH_USER,
} from './types';

import db from '../database';

export const getToken = () => window.localStorage.getItem('access_token');

export const fetchUser = () => (dispatch) => {
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

export const doLogin = (token) => {
  if (typeof Storage !== 'undefined') {
    window.localStorage.setItem('access_token', token);
  }
};

export const signInWithSpotify = (e) => {
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

export const signOut = () => {
  window.localStorage.removeItem('access_token');
};

export const retrieveUserData = async () => {
  const authenticated = getToken();
  const response = await axios({
    url: 'https://api.spotify.com/v1/me',
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + authenticated,
    },
  });

  if (response.status !== 200) {
    if (response.status === 401) {
      signOut(dispatch);
    }
    throw Error("User data couldn't be loaded");
  }

  return response.data;
};

export const loadLibraryFromDb = (offset, limit) => (dispatch) => {
  db.tracks
    .orderBy('name')
    .offset(offset)
    .limit(limit)
    .toArray()
    .then((results) => {
      dispatch({
        type: LOAD_LIBRARY_PAGE,
        payload: results,
      });
    });
};

export const markDb = () => (dispatch) => {
  return db.tracks.toCollection().modify((track) => {
    track.isSynced = 0;
  });
};

export const doPurgeDb = (_) => (dispatch) => {
  db.tracks
    .where('isSynced')
    .equals(0)
    .delete()
    .then((count) => console.log('Purged ' + count + ' entries.'));
};

export const addToLoadQueue =
  (url, purge = false) =>
  (dispatch) => {
    dispatch({
      type: ADD_TO_LOAD_QUEUE,
      payload: url,
      purge: purge,
    });
  };

export const retrieveLibrary = (_, queue) => (dispatch) => {
  const authenticated = getToken();
  const { url } = queue;

  axios({
    url,
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + authenticated,
    },
  })
    .then((response) => response.data)
    .then((response) => {
      let objects = [];
      for (const item of response.items) {
        const track = item.track;
        if (!track) {
          continue;
        }

        const itemObject = {
          id: track.id,
          uri: track.uri,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          image: track.album.images[0]?.url || 'https://picsum.photos/200',
          duration_ms: track.duration_ms,
          isSynced: 1,
        };
        objects.push(itemObject);
      }
      db.tracks.bulkPut(objects);
      db.tracks.count().then((count) => {
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
    })
    .catch((response) => {
      setTimeout(() => {
        retrieveLibrary(authenticated, queue)(dispatch);
      }, 1000);
    });
};

export const firstPage = () => (dispatch) => {
  dispatch({
    type: FIRST_PAGE,
  });
};

export const previousPage = () => (dispatch) => {
  dispatch({
    type: PREVIOUS_PAGE,
  });
};

export const nextPage = () => (dispatch) => {
  dispatch({
    type: NEXT_PAGE,
  });
};

export const retrievePlaylists =
  (_, url = 'https://api.spotify.com/v1/me/playlists?limit=50', append = false) =>
  (dispatch) => {
    const authenticated = getToken();
    fetch(url, {
      method: 'get',
      headers: new Headers({
        Authorization: 'Bearer ' + authenticated,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.next && response.total > response.offset + response.limit) {
          setTimeout(() => retrievePlaylists(authenticated, abortSignal, response.next, true)(dispatch), 1000);
        }
        dispatch({
          type: append ? APPEND_PLAYLISTS : FETCH_PLAYLISTS,
          payload: response,
        });
      })
      .catch(() => {
        setTimeout(() => retrievePlaylists(authenticated, abortSignal, url, append)(dispatch), 1000);
      });
  };

export const togglePlaylist = (id, userId) => (dispatch) => {
  dispatch({
    type: TOGGLE_PLAYLIST,
    payload: { id, userId },
  });
};

export const setCheckedPlaylists = (checked) => (dispatch) => {
  dispatch({
    type: CHECKED_PLAYLISTS,
    payload: checked,
  });
};

export const choosePlayer = (id) => {
  const authenticated = getToken();
  const url = 'https://api.spotify.com/v1/me/player';

  return axios({
    url,
    method: 'put',
    headers: {
      Authorization: 'Bearer ' + authenticated,
    },
    data: {
      device_ids: [id],
    },
  });
};

export const retrievePlayerInfo = async () => {
  const authenticated = getToken();
  try {
    const response = await axios({
      url: 'https://api.spotify.com/v1/me/player/devices',
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + authenticated,
      },
    });

    return response.data;
  } catch (e) {
    if (e.response && e.response.status === 401) {
      signOut();
    } else {
      throw e;
    }
  }
};

export const retrievePlayState = async () => {
  const authenticated = getToken();
  const response = await axios({
    url: 'https://api.spotify.com/v1/me/player',
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + authenticated,
    },
  });

  if (response.status !== 200) {
    if (response.status == 401) {
      signOut();
    }
    throw Error("Player state couldn't be loaded");
  }
  return response.data;
};

export const toggleConfig = () => (dispatch) => {
  dispatch({
    type: TOGGLE_CONFIG,
  });
};

export const setConfig = (key, value) => (dispatch) => {
  dispatch({
    type: UPDATE_CONFIG,
    config: {
      [key]: value,
    },
  });
};
