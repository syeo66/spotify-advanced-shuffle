import axios from 'axios';
import PropTypes from 'prop-types';
import random from 'random';
import React, { memo, useCallback, useState } from 'react';
import { useQuery } from 'react-query';
import { connect } from 'react-redux';

import { getConfigsForUser, getToken, retrievePlaylists, retrieveUserData } from '../actions';
import db from '../database';

const ShuffleButton = (props) => {
  const [isShuffleLoading, setIsShuffleLoading] = useState(false);
  const { data: user, isLoading } = useQuery('userinfo', retrieveUserData);
  const { data: config, isLoading: isConfigLoading } = useQuery(['config', user?.id], getConfigsForUser(user?.id));

  const enabled = !isShuffleLoading && !isLoading && !isConfigLoading && props.dbSize > 0;
  const icon = isShuffleLoading ? 'fas fa-compact-disc fa-spin' : 'fas fa-random';

  const chunkArray = (myArray, chunk_size) => {
    let results = [];

    while (myArray.length) {
      results.push(myArray.splice(0, chunk_size));
    }

    return results;
  };

  const createRandomPlaylist = useCallback(() => {
    const authenticated = getToken();
    return new Promise((resolve) => {
      const url = 'https://api.spotify.com/v1/me/playlists';
      axios({
        url,
        method: 'post',
        headers: {
          Authorization: `Bearer ${authenticated}`,
        },
        data: {
          name: config.randomListName,
          description: 'Advanced Shuffle for Spotify Helper Playlist',
          public: false,
        },
      })
        .then((response) => response.data)
        .then((response) => {
          resolve(response);
        });
    });
  }, [config?.randomListName]);

  const startPlayback = (playlist) => {
    const authenticated = getToken();
    const url = 'https://api.spotify.com/v1/me/player/play';
    axios({
      url,
      method: 'put',
      headers: {
        Authorization: `Bearer ${authenticated}`,
      },
      data: {
        context_uri: playlist.uri,
      },
    }).then(() => setIsShuffleLoading(false));
  };

  const addRandomTracks = useCallback(async (playlist, trackUris) => {
    const authenticated = getToken();
    const playlistId = playlist.id;
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    return axios({
      url,
      method: 'post',
      headers: {
        Authorization: `Bearer ${authenticated}`,
      },
      data: {
        uris: trackUris,
        position: 0,
      },
    });
  }, []);

  const fillRandomPlaylist = useCallback(
    (playlist) => {
      const trackCount = config.amountType === 'minutes' ? Math.round(config.trackMinutes / 2) : config.trackCount;
      const count = Math.min(Math.round(trackCount * 1.5), 1024);
      const addTracks = (numbers) => {
        db.tracks.toArray(async (library) => {
          let minutes = 0;
          const normaled = numbers.map(() => random.int(0, library.length - 1));
          const slices = chunkArray([...new Set(normaled)].slice(0, trackCount), 100);

          const promises = slices.map(async (chunk) => {
            if (config.amountType === 'minutes' && minutes >= config.trackMinutes) {
              return;
            }
            let tracks = chunk
              .map((number) => {
                if (config.amountType === 'minutes' && minutes >= config.trackMinutes) {
                  return null;
                }
                minutes += library[number].duration_ms / 60000;
                return library[number].uri;
              })
              .filter(Boolean);
            return addRandomTracks(playlist, tracks);
          });

          await Promise.all(promises);

          setTimeout(() => startPlayback(playlist), 1000);
        });
      };
      addTracks([...Array(count)].map(() => random.float()));
    },
    [addRandomTracks, config?.amountType, config?.trackCount, config?.trackMinutes]
  );

  const purgeRandomPlaylist = useCallback(
    (playlist) => {
      return new Promise((resolve1) => {
        if (!config.purgeOnShuffle) {
          resolve1(playlist);
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
                Authorization: `Bearer ${authenticated}`,
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
          const removeChunk = (chnks) => {
            return new Promise((resolve) => {
              const [chunk] = chnks.slice(0, 1) || [];
              const chunksLeft = chnks.slice(1, chnks.length);
              if (!chnks || chnks.length === 0) {
                resolve();
                return;
              }
              purgePlaylistTracks(playlist, chunk).then(() => {
                removeChunk(chunksLeft).then(() => resolve());
              });
            });
          };
          removeChunk(chunks).then(() => resolve1(playlist));
        });
      });
    },
    [config?.purgeOnShuffle]
  );

  const startShuffle = useCallback(
    (event) => {
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
    },
    [createRandomPlaylist, fillRandomPlaylist, props, purgeRandomPlaylist]
  );

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
};

const purgePlaylistTracks = (playlist, trackUris) => {
  return new Promise((resolve) => {
    const authenticated = getToken();
    const playlistId = playlist.id;
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    if (!trackUris || trackUris.length === 0) {
      resolve();
      return;
    }
    axios({
      url,
      method: 'delete',
      headers: {
        Authorization: `Bearer ${authenticated}`,
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

function mapStateToProps({ data }) {
  return {
    isLoaded: data.loadQueue.reduce((acc, queue) => acc && queue.isLoaded, true),
    dbSize: data.dbSize,
    existingPlaylist: data.playlists
      ? data.playlists.reduce((accumulator, currentValue) => {
          return accumulator || (currentValue.name === data.config.randomListName ? currentValue : null);
        }, null)
      : null,
  };
}

export default connect(mapStateToProps, { retrievePlaylists })(memo(ShuffleButton));
