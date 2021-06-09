import axios from 'axios';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import random from 'random';
import React, { memo, useState } from 'react';

import db from '../database';
import { getConfigsForUser, getToken, retrievePlaylists, retrieveUserData } from '../actions';
import { useQuery } from 'react-query';

const ShuffleButton = (props) => {
  const [isShuffleLoading, setIsShuffleLoading] = useState(false);
  const { data: user, isLoading } = useQuery('userinfo', retrieveUserData);
  const { data: config, isLoading: isConfigLoading } = useQuery(['config', user?.id], getConfigsForUser(user?.id));

  const enabled =
    !isShuffleLoading &&
    !isLoading &&
    !isConfigLoading &&
    ((props.librarySize && props.dbSize >= props.librarySize * 0.9) || props.isLoaded);
  const icon = isShuffleLoading ? 'fas fa-compact-disc fa-spin' : 'fas fa-random';

  const chunkArray = (myArray, chunk_size) => {
    let results = [];

    while (myArray.length) {
      results.push(myArray.splice(0, chunk_size));
    }

    return results;
  };

  const createRandomPlaylist = () => {
    const authenticated = getToken();
    return new Promise((resolve) => {
      const url = 'https://api.spotify.com/v1/me/playlists';
      axios({
        url,
        method: 'post',
        headers: {
          Authorization: 'Bearer ' + authenticated,
        },
        data: {
          name: config.randomListName,
          description: 'Spotify Advanced Shuffle Helper Playlist',
          public: false,
        },
      })
        .then((response) => response.data)
        .then((response) => {
          resolve(response);
        });
    });
  };

  const startPlayback = (playlist) => {
    const authenticated = getToken();
    const url = 'https://api.spotify.com/v1/me/player/play';
    axios({
      url,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + authenticated,
      },
      data: {
        context_uri: playlist.uri,
      },
    }).then(() => setIsShuffleLoading(false));
  };

  const addRandomTracks = (playlist, trackUris) => {
    const authenticated = getToken();
    const playlistId = playlist.id;
    const url = 'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks';
    axios({
      url,
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + authenticated,
      },
      data: {
        uris: trackUris,
        position: 0,
      },
    })
      .then((response) => response.data)
      .then(() => {
        startPlayback(playlist);
      });
  };

  const fillRandomPlaylist = (playlist) => {
    const trackCount = config.amountType == 'minutes' ? Math.round(config.trackMinutes / 2) : config.trackCount;
    const count = Math.min(Math.round(trackCount * 1.5), 1024);
    const addTracks = (numbers) => {
      db.tracks.toArray((library) => {
        let minutes = 0;
        const normaled = numbers.map(() => random.int(0, library.length - 1));
        const slices = chunkArray([...new Set(normaled)].slice(0, trackCount), 100);
        slices.forEach((chunk) => {
          if (config.amountType == 'minutes' && minutes >= config.trackMinutes) {
            return;
          }
          let tracks = chunk
            .map((number) => {
              if (config.amountType == 'minutes' && minutes >= config.trackMinutes) {
                return;
              }
              minutes += library[number].duration_ms / 60000;
              return library[number].uri;
            })
            .filter((el) => el != null);
          addRandomTracks(playlist, tracks);
        });
      });
    };
    addTracks([...Array(count)].map(() => random.float()));
  };

  const purgePlaylistTracks = (playlist, trackUris) => {
    return new Promise((resolve) => {
      const authenticated = getToken();
      const playlistId = playlist.id;
      const url = 'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks';
      if (!trackUris || trackUris.length == 0) {
        resolve();
        return;
      }
      axios({
        url,
        method: 'delete',
        headers: {
          Authorization: 'Bearer ' + authenticated,
        },
        data: {
          tracks: trackUris,
        },
      })
        .then((response) => response.data)
        .then(() => {
          resolve();
        });
    });
  };

  const purgeRandomPlaylist = (playlist) => {
    return new Promise((resolve) => {
      if (!config.purgeOnShuffle) {
        resolve(playlist);
        return;
      }
      const authenticated = getToken();
      const preparePurge = (url, uris = []) => {
        return new Promise((resolve) => {
          if (!url) {
            resolve(uris);
            return;
          }
          axios({
            url,
            method: 'get',
            headers: {
              Authorization: 'Bearer ' + authenticated,
            },
          })
            .then((response) => response.data)
            .then(async (response) => {
              const responseUris = response.items.map((element) => {
                return { uri: element.track.uri };
              });
              const trackUris = await preparePurge(response.next, [...uris, ...responseUris]);
              resolve(trackUris);
            });
        });
      };
      preparePurge(playlist.tracks.href).then((trackUris) => {
        const chunks = chunkArray(trackUris, 100);
        const removeChunk = (chunks) => {
          return new Promise((resolve) => {
            const chunk = chunks.slice(0, 1)[0];
            const chunksLeft = chunks.slice(1, chunks.length);
            if (!chunks || chunks.length == 0) {
              resolve();
              return;
            }
            purgePlaylistTracks(playlist, chunk).then(() => {
              removeChunk(chunksLeft).then(() => resolve());
            });
          });
        };
        removeChunk(chunks).then(() => resolve(playlist));
      });
    });
  };

  const startShuffle = (event) => {
    event.preventDefault();
    setIsShuffleLoading(true);
    const { existingPlaylist } = props;
    if (!existingPlaylist) {
      createRandomPlaylist().then((playlist) => {
        fillRandomPlaylist(playlist);
      });
      return;
    }
    purgeRandomPlaylist(existingPlaylist).then((playlist) => {
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

ShuffleButton.propTypes = {
  dbSize: PropTypes.number.isRequired,
  existingPlaylist: PropTypes.object,
  isLoaded: PropTypes.bool.isRequired,
  librarySize: PropTypes.number.isRequired,
};

function mapStateToProps({ data }) {
  return {
    isLoaded: data.loadQueue.reduce((acc, queue) => acc && queue.isLoaded, true),
    librarySize: data.loadQueue.reduce((acc, queue) => acc + queue.size, 0),
    dbSize: data.dbSize,
    existingPlaylist: data.playlists
      ? data.playlists.reduce((accumulator, currentValue) => {
          return accumulator || (currentValue.name == data.config.randomListName ? currentValue : null);
        }, null)
      : null,
  };
}

export default connect(mapStateToProps, { retrievePlaylists })(memo(ShuffleButton));
