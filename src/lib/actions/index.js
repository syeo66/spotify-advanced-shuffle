import axios from 'axios';

import db from '../database';
import {
  ADD_TO_LOAD_QUEUE,
  APPEND_PLAYLISTS,
  CHECKED_PLAYLISTS,
  DB_COUNT,
  FETCH_LIBRARY,
  FIRST_PAGE,
  LOAD_LIBRARY_PAGE,
  NEXT_PAGE,
  PREVIOUS_PAGE,
  PURGE_LOAD_QUEUE,
  TOGGLE_PLAYLIST,
} from './types';

export const getToken = () => window.localStorage.getItem('access_token');

export const fetchUser = () => () => {
  for (const entry of window.location.hash.substr(1).split('&')) {
    const splitEntry = entry.split('=');
    if (splitEntry[0] === 'access_token') {
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
    `https://accounts.spotify.com/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${appUrl}&response_type=token` +
    `&scope=${encodeURIComponent(scopes)}`;
  window.open(url, 'spotify', 'width=400, height=500');
};

export const signOut = () => {
  window.localStorage.removeItem('access_token');
};

export const retrieveUserData = async () => {
  const authenticated = getToken();
  if (!authenticated) {
    return null;
  }
  const response = await axios({
    url: 'https://api.spotify.com/v1/me',
    method: 'get',
    headers: {
      Authorization: `Bearer ${authenticated}`,
    },
  });

  return response.data;
};

export const loadLibraryFromDb = (offset, limit) => (dispatch) => {
  db.tracks.count().then((count) => {
    dispatch({
      type: DB_COUNT,
      payload: {
        dbSize: count,
      },
    });
  });
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

export const markDb = () => () => {
  return db.tracks.toCollection().modify((track) => {
    track.isSynced = 0;
  });
};

export const doPurgeDb = () => () => {
  const token = getToken();
  if (!token) {
    // eslint-disable-next-line no-console
    console.log('no purge');
    return;
  }
  db.tracks
    .where('isSynced')
    .equals(0)
    .delete()
    // eslint-disable-next-line no-console
    .then((count) => console.log(`Purged ${count} entries.`));
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

export const purgeLoadQueue = () => (dispatch) => {
  dispatch({ type: PURGE_LOAD_QUEUE });
};

export const retrieveLibrary = (_, queue) => (dispatch) => {
  const authenticated = getToken();
  if (!authenticated) {
    return null;
  }
  const { url } = queue;

  axios({
    url,
    method: 'get',
    headers: {
      Authorization: `Bearer ${authenticated}`,
    },
    raxConfig: { retry: 20 },
  })
    .then((response) => response.data)
    .then((response) => {
      let objects = [];
      for (const item of response.items) {
        const { track } = item || {};
        if (!track?.artists?.[0]?.name) {
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
  (_, url = 'https://api.spotify.com/v1/me/playlists?limit=50') =>
  (dispatch) => {
    const authenticated = getToken();
    if (!authenticated) {
      return null;
    }
    axios({
      url,
      method: 'get',
      headers: {
        Authorization: `Bearer ${authenticated}`,
      },
    })
      .then((response) => response.data)
      .then((response) => {
        if (response.next && response.total > response.offset + response.limit) {
          retrievePlaylists(authenticated, response.next)(dispatch);
        }
        dispatch({
          type: APPEND_PLAYLISTS,
          payload: response,
        });
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
  if (!authenticated) {
    return null;
  }
  const url = 'https://api.spotify.com/v1/me/player';

  return axios({
    url,
    method: 'put',
    headers: {
      Authorization: `Bearer ${authenticated}`,
    },
    data: {
      device_ids: [id],
    },
  });
};

export const retrievePlayerInfo = async () => {
  const authenticated = getToken();
  if (!authenticated) {
    return null;
  }
  const response = await axios({
    url: 'https://api.spotify.com/v1/me/player/devices',
    method: 'get',
    headers: {
      Authorization: `Bearer ${authenticated}`,
    },
  });

  return response.data;
};

export const retrievePlayState = async () => {
  const authenticated = getToken();
  if (!authenticated) {
    return null;
  }
  const response = await axios({
    url: 'https://api.spotify.com/v1/me/player',
    method: 'get',
    headers: {
      Authorization: `Bearer ${authenticated}`,
    },
  });

  if (response.status !== 200) {
    throw Error("Player state couldn't be loaded");
  }
  return response.data;
};

export const setConfigForUser = (userId) => (key) => (value) => {
  const store = `${userId}.${key}`;
  window.localStorage.setItem(store, value);
};

export const getConfigForUser =
  (userId) =>
  (key, defaultValue = null) => {
    const store = `${userId}.${key}`;
    const value = window.localStorage.getItem(store);

    if (key === 'purgeOnShuffle') {
      return value === 'true' ? true : value === 'false' ? false : undefined;
    }

    return window.localStorage.getItem(store) || defaultValue;
  };

export const getConfigsForUser = (userId) => {
  const getConfig = getConfigForUser(userId);

  return () => {
    return {
      randomListName: getConfig('randomListName'),
      purgeOnShuffle: getConfig('purgeOnShuffle'),
      amountType: getConfig('amountType'),
      trackMinutes: getConfig('trackMinutes'),
      trackCount: getConfig('trackCount'),
    };
  };
};
