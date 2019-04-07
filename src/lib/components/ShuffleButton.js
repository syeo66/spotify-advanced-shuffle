import React, { memo, useState } from 'react';
import { connect } from 'react-redux';
import { retrievePlaylists } from '../actions';
import db from '../database';
import random from 'random';

const ShuffleButton = props => {
  const [isShuffleLoading, setIsShuffleLoading] = useState(false);

  const enabled =
    !isShuffleLoading && ((props.librarySize && props.dbSize >= props.librarySize * 0.9) || props.isLoaded);
  const icon = isShuffleLoading ? 'fas fa-compact-disc fa-spin' : 'fas fa-random';

  const chunkArray = (myArray, chunk_size) => {
    let results = [];

    while (myArray.length) {
      results.push(myArray.splice(0, chunk_size));
    }

    return results;
  };

  const createRandomPlaylist = authenticated => {
    return new Promise((resolve, reject) => {
      const url = 'https://api.spotify.com/v1/me/playlists';
      fetch(url, {
        method: 'post',
        headers: new Headers({
          Authorization: 'Bearer ' + authenticated
        }),
        body: JSON.stringify({
          name: props.config.randomListName,
          description: 'Spotify Advanced Shuffle Helper Playlist',
          public: false
        })
      })
        .then(response => response.json())
        .then(response => {
          resolve(response);
        });
    });
  };

  const startPlayback = playlist => {
    const authenticated = props.authenticated;
    const url = 'https://api.spotify.com/v1/me/player/play';
    fetch(url, {
      method: 'put',
      headers: new Headers({
        Authorization: 'Bearer ' + authenticated
      }),
      body: JSON.stringify({
        context_uri: playlist.uri
      })
    }).then(response => setIsShuffleLoading(false));
  };

  const addRandomTracks = (playlist, trackUris) => {
    const authenticated = props.authenticated;
    const playlistId = playlist.id;
    const url = 'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks';
    fetch(url, {
      method: 'post',
      headers: new Headers({
        Authorization: 'Bearer ' + authenticated
      }),
      body: JSON.stringify({
        uris: trackUris,
        position: 0
      })
    })
      .then(response => response.json())
      .then(response => {
        startPlayback(playlist);
      });
  };

  const fillRandomPlaylist = playlist => {
    const trackCount =
      props.config.amountType == 'minutes' ? Math.round(props.config.trackMinutes / 2) : props.config.trackCount;
    const count = Math.min(Math.round(trackCount * 1.1), 1024);
    const addTracks = numbers => {
      db.tracks.toArray(library => {
        let minutes = 0;
        const normaled = numbers.map(number => Math.floor(number * library.length));
        const slices = chunkArray([...new Set(normaled)].slice(0, trackCount), 100);
        slices.forEach(chunk => {
          if (props.config.amountType == 'minutes' && minutes >= props.config.trackMinutes) {
            return;
          }
          let tracks = chunk
            .map(number => {
              if (props.config.amountType == 'minutes' && minutes >= props.config.trackMinutes) {
                return;
              }
              minutes += library[number].duration_ms / 60000;
              return library[number].uri;
            })
            .filter(el => el != null);
          addRandomTracks(playlist, tracks);
        });
      });
    };
    addTracks([...Array(count)].map(_ => random.float()));
  };

  const purgePlaylistTracks = (playlist, trackUris) => {
    return new Promise((resolve, reject) => {
      const authenticated = props.authenticated;
      const playlistId = playlist.id;
      const url = 'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks';
      if (!trackUris || trackUris.length == 0) {
        resolve();
        return;
      }
      fetch(url, {
        method: 'delete',
        headers: new Headers({
          Authorization: 'Bearer ' + authenticated
        }),
        body: JSON.stringify({
          tracks: trackUris
        })
      })
        .then(response => response.json())
        .then(response => {
          resolve();
        });
    });
  };

  const purgeRandomPlaylist = playlist => {
    return new Promise((resolve, reject) => {
      if (!props.config.purgeOnShuffle) {
        resolve(playlist);
        return;
      }
      const authenticated = props.authenticated;
      const preparePurge = (url, uris = []) => {
        return new Promise((resolve, reject) => {
          if (!url) {
            resolve(uris);
            return;
          }
          fetch(url, {
            method: 'get',
            headers: new Headers({
              Authorization: 'Bearer ' + authenticated
            })
          })
            .then(response => response.json())
            .then(async response => {
              const responseUris = response.items.map(element => {
                return { uri: element.track.uri };
              });
              const trackUris = await preparePurge(response.next, [...uris, ...responseUris]);
              resolve(trackUris);
            });
        });
      };
      preparePurge(playlist.tracks.href).then(trackUris => {
        const chunks = chunkArray(trackUris, 100);
        const removeChunk = chunks => {
          return new Promise((resolve, reject) => {
            const chunk = chunks.slice(0, 1)[0];
            const chunksLeft = chunks.slice(1, chunks.length);
            if (!chunks || chunks.length == 0) {
              resolve();
              return;
            }
            purgePlaylistTracks(playlist, chunk).then(_ => {
              removeChunk(chunksLeft).then(_ => resolve());
            });
          });
        };
        removeChunk(chunks).then(_ => resolve(playlist));
      });
    });
  };

  const startShuffle = event => {
    event.preventDefault();
    setIsShuffleLoading(true);
    const existingPlaylist = props.existingPlaylist;
    if (!existingPlaylist) {
      createRandomPlaylist(props.authenticated).then(playlist => {
        fillRandomPlaylist(playlist);
      });
      return;
    }
    purgeRandomPlaylist(existingPlaylist).then(playlist => {
      fillRandomPlaylist(playlist);
    });
  };

  return (
    <button className="btn btn-primary" disabled={!enabled} onClick={startShuffle}>
      <i className={icon} />
      &nbsp;Shuffle
    </button>
  );
};

function mapStateToProps({ data, auth }) {
  return {
    config: data.config,
    isLoaded: data.loadQueue.reduce((acc, queue) => acc && queue.isLoaded, true),
    librarySize: data.loadQueue.reduce((acc, queue) => acc + queue.size, 0),
    dbSize: data.dbSize,
    authenticated: auth,
    existingPlaylist: data.playlists
      ? data.playlists.reduce((accumulator, currentValue) => {
          return accumulator || (currentValue.name == data.config.randomListName ? currentValue : null);
        }, null)
      : []
  };
}

export default connect(
  mapStateToProps,
  { retrievePlaylists }
)(memo(ShuffleButton));
