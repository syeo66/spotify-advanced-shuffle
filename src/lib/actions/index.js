import { 
    RETRIEVE_AUTH_TOKEN, 
    FETCH_USER, 
    FETCH_PLAYER,
    FETCH_LIBRARY, 
    PREVIOUS_PAGE,
    NEXT_PAGE,
    FETCH_PLAYLISTS,
    APPEND_PLAYLISTS,
    FETCH_PLAY_STATE,
    TOGGLE_CONFIG,
    UPDATE_CONFIG,
} from "./types";
import db from '../database';

export const fetchUser = () => dispatch => {
    for (const entry of window.location.hash.substr(1).split('&')) {
        const splitEntry = entry.split('=');
        if (splitEntry[0] == 'access_token') {
            if (window.opener) {
                window.opener.postMessage({
                    type: 'access_token',
                    token: splitEntry[1]
                }, "*");
                window.close();
            }
        }
    }
}

export const doLogin = token => dispatch => {
    if (typeof(Storage) !== "undefined") {
        window.localStorage.setItem('access_token', token);
    }
    dispatch({
        type: RETRIEVE_AUTH_TOKEN,
        payload: token,
    });
}

export const signInWithSpotify = () => dispatch => {
    const appUrl = encodeURIComponent(window.location.href.split('#')[0]);
    const scopes = "user-library-read playlist-read-private playlist-modify-private user-modify-playback-state user-read-playback-state";
    const url = "https://accounts.spotify.com/authorize?client_id="+process.env.CLIENT_ID+
        "&redirect_uri="+appUrl+
        "&response_type=token"+
        "&scope="+encodeURIComponent(scopes);
    window.open(url, 'spotify', "width=400, height=500");
}

export const signOut = () => dispatch => {
    doSignOut(dispatch);
}

const doSignOut = dispatch => {
    if (typeof(Storage) !== "undefined") {
        window.localStorage.removeItem('access_token');
    }
    dispatch({
        type: RETRIEVE_AUTH_TOKEN,
        payload: null,
    });
}

export const retrieveUserData = authenticated => dispatch => {
    fetch("https://api.spotify.com/v1/me", { 
        method: 'get', 
        headers: new Headers({
            'Authorization': 'Bearer '+authenticated
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
}

export const importDb = _ => dispatch => {
    db.tracks.toCollection().modify(track => {
        track.isSynced = 0;
    });
    doImportDb(dispatch);
}

const doPurgeDb = _ => {
    db.tracks.where('isSynced').equals(0).delete()
        .then(count => console.log('Purged '+count+' entries.'));
}

const doImportDb = (dispatch, currentCount = 0, totalCount = 0) => {
    db.tracks.toArray(objects => {
        const payload = {
                total: totalCount,
                current: currentCount,
                items: objects,
            };
        dispatch({
            type: FETCH_LIBRARY,
            payload: payload,
        });
    });
}

export const retrieveLibrary = (authenticated, url = "https://api.spotify.com/v1/me/tracks?limit=50", append = false) => dispatch => {
    fetch(url, {
        method: 'get', 
        headers: new Headers({
            'Authorization': 'Bearer '+authenticated
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
                isSynced: 1,
            };
            objects.push(itemObject);
        }
        db.tracks.bulkPut(objects);
        if (response.offset + response.items.length >= response.total) {
            doPurgeDb();
        }
        doImportDb(dispatch, response.offset + response.items.length, response.total);
        if (response.next) {
            retrieveLibrary(authenticated, response.next, true)(dispatch);
        }
    });
}

export const previousPage = () => dispatch => {
    dispatch({
        type: PREVIOUS_PAGE,
    });
}

export const nextPage = () => dispatch => {
    dispatch({
        type: NEXT_PAGE,
    });
}

export const retrievePlaylists = (authenticated, url = "https://api.spotify.com/v1/me/playlists?limit=50", append = false) => dispatch => {
    fetch(url, { 
        method: 'get', 
        headers: new Headers({
            'Authorization': 'Bearer '+authenticated
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
}

export const retrievePlayerInfo = authenticated => dispatch => {
    fetch("https://api.spotify.com/v1/me/player/devices", { 
        method: 'get', 
        headers: new Headers({
            'Authorization': 'Bearer '+authenticated
        }),
    })
    .then(response => response.json())
    .then(response => {
        dispatch({
            type: FETCH_PLAYER,
            devices: response,
        });
    });
}

export const retrievePlayState = authenticated => dispatch => {
    fetch("https://api.spotify.com/v1/me/player", { 
        method: 'get', 
        headers: new Headers({
            'Authorization': 'Bearer '+authenticated
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
            type: FETCH_PLAY_STATE,
            playstate: response,
        });
    });
}

export const toggleConfig = () => dispatch => {
    dispatch({
        type: TOGGLE_CONFIG,
    });
}

export const setConfig = (key, value) => dispatch => {
    dispatch({
        type: UPDATE_CONFIG,
        config: {
            [key]: value,
        },
    });
}
