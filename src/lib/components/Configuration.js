import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import Fallback from './Fallback';
import { retrieveUserData, setConfigForUser, getConfigsForUser } from '../actions';

const Configuration = ({ active }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useQuery('userinfo', retrieveUserData);
  const { data: config, isLoading: isConfigLoading } = useQuery(['config', user?.id], getConfigsForUser(user?.id));

  const setConfig = setConfigForUser(user?.id);
  const configMutation = useMutation(({ key, value }) => setConfig(key)(value), {
    onSuccess: () => {
      queryClient.invalidateQueries('config');
    },
  });

  useEffect(() => {
    if (!user || !config || isLoading || isError) {
      return;
    }

    // set defaults
    if (!config.randomListName) {
      setConfig('randomListName')('Advanced Playlist');
    }

    if (config.purgeOnShuffle === undefined) {
      setConfig('purgeOnShuffle')('true');
    }

    if (!config.amountType) {
      setConfig('amountType')('minutes');
    }

    if (!config.trackMinutes) {
      setConfig('trackMinutes')(120);
    }

    if (!config.trackCount) {
      setConfig('trackCount')(30);
    }
  }, [config, isError, isLoading, setConfig, user]);

  const handleChange = useCallback(
    (event) => {
      const value = parseInt(event.target.value) || '';
      const key = config.amountType === 'minutes' ? 'trackMinutes' : 'trackCount';
      const maxValue = config.amountType === 'minutes' ? 1500 : 500;
      configMutation.mutate({ key, value: Math.max(Math.min(value, maxValue), 0) });
    },
    [config?.amountType, configMutation]
  );

  const handlePurgeChange = useCallback(() => {
    configMutation.mutate({ key: 'purgeOnShuffle', value: !config.purgeOnShuffle ? 'true' : 'false' });
  }, [config?.purgeOnShuffle, configMutation]);

  const handlePlaylistNameChange = useCallback(
    (event) => {
      const input = event.target.value.trim();
      const value = input || 'Advanced Shuffle';
      configMutation.mutate({ key: 'randomListName', value });
    },
    [configMutation]
  );

  const setAmountTypeConfig = useCallback(
    (value) => configMutation.mutate({ key: 'amountType', value }),
    [configMutation]
  );
  const setAmountTypeConfigCount = useCallback(() => setAmountTypeConfig('count'), [setAmountTypeConfig]);
  const setAmountTypeConfigMinutes = useCallback(() => setAmountTypeConfig('minutes'), [setAmountTypeConfig]);

  if (!active) {
    return '';
  }

  if (isLoading || isConfigLoading || !config) {
    return <Fallback />;
  }

  const type = config.amountType === 'minutes' ? 'Minutes' : 'Trackcount';
  const value = config.amountType === 'minutes' ? config.trackMinutes : config.trackCount;
  const sentence = config.amountType === 'minutes' ? 'hours of music.' : 'random tracks.';
  const sentenceValue = config.amountType === 'minutes' ? Math.round((value / 60) * 100) / 100 : value;
  const purgeSentence = config.purgeOnShuffle
    ? 'An existing playlist will be purged before adding new tracks.'
    : 'The tracks will be prepended if there is an existing playlist.';

  if (!active) {
    return '';
  }

  if (isLoading) {
    return <Fallback />;
  }

  return (
    <div className="pt-2 mt-2 border-top border-bottom">
      <div className="input-group mb-1 ">
        <div className="input-group-prepend">
          <button
            className="btn btn-outline-secondary dropdown-toggle"
            type="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {type}
          </button>
          <div className="dropdown-menu">
            <a className="dropdown-item" href="#" onClick={setAmountTypeConfigCount}>
              Trackcount
            </a>
            <a className="dropdown-item" href="#" onClick={setAmountTypeConfigMinutes}>
              Minutes
            </a>
          </div>
        </div>
        <input
          type="text"
          className="form-control"
          onChange={handleChange}
          aria-label="Text input with dropdown button"
          value={value}
        />
      </div>
      <small id="shuffleTypeHelp" className="mt-0 mb-3 form-text text-muted">
        The playlist will be filled with {sentenceValue} {sentence}
      </small>

      <div className="form-group form-check custom-switch">
        <input
          type="checkbox"
          className="custom-control-input"
          id="purgeOnShuffle"
          onChange={handlePurgeChange}
          checked={config.purgeOnShuffle}
        />
        <label className="custom-control-label" htmlFor="purgeOnShuffle">
          Purge playlist
        </label>
        <small id="purgeHelp" className="form-text text-muted">
          {purgeSentence}
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="playlistName">Playlist name</label>
        <input
          type="email"
          className="form-control"
          id="playlistName"
          aria-describedby="playlistNameHelp"
          placeholder="Playlist name"
          onChange={handlePlaylistNameChange}
          value={config?.randomListName}
        />
        <small id="playlistNameHelp" className="form-text text-muted">
          The random playlist will be called «{config?.randomListName}»
        </small>
      </div>
    </div>
  );
};

Configuration.propTypes = {
  active: PropTypes.bool,
};

export default memo(Configuration);
