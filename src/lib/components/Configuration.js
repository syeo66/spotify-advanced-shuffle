import React, { memo, useEffect } from 'react';
import { connect } from 'react-redux';
import { setConfig } from '../actions';

const Configuration = (props) => {
  const setConfig = (key, value) => {
    props.setConfig(key, value);
    if (typeof(Storage) !== "undefined") {
      const userId = props.user.id;
      window.localStorage.setItem(userId+'.'+key, value);
    }
  }

  // TODO: This should be loaded further up the chain
  useEffect(() => {
    if (!props.user) {
        return;
    }

    if (typeof(Storage) !== "undefined") {
        const userId = props.user.id;
        [
            'amountType',
            'randomListName',
            'trackCount',
            'trackMinutes',
            'purgeOnShuffle',
        ].forEach(key => {
            const mapping = key => {
                switch (key) {
                    case 'purgeOnShuffle':
                        return window.localStorage.getItem(userId+'.'+key) == 'true';
                    default:
                        return window.localStorage.getItem(userId+'.'+key);
                }
            };
            const value = mapping(key);
            if (value !== null) {
              setConfig(key, value);
            }
        });
    }
  }, [props.user]);

  const handleChange = event => {
    const value = parseInt(event.target.value) || '';
    const key = props.config.amountType == 'minutes'
      ? 'trackMinutes' : 'trackCount';
    const maxValue = props.config.amountType == 'minutes'
      ? 1500 : 500;
    setConfig(key, Math.max(Math.min(value, maxValue), 0));
  };

  const handlePurgeChange = _ => {
    setConfig('purgeOnShuffle', !props.config.purgeOnShuffle);
  }

  const handlePlaylistNameChange = event => {
    const input = event.target.value.trim();
    const value = input || 'Advanced Shuffle';
    setConfig('randomListName', value);
  }

  const type = props.config.amountType == 'minutes' ? 'Minutes' : 'Trackcount';
  const value = props.config.amountType == 'minutes'
      ? props.config.trackMinutes
      : props.config.trackCount;
  const sentence = props.config.amountType == 'minutes' ? 'hours of music.' : 'random tracks.';
  const sentenceValue = props.config.amountType == 'minutes'
      ? Math.round(value / 60 * 100) / 100
      : value;
  const purgeSentence = props.config.purgeOnShuffle
      ? "An existing playlist will be purged before adding new tracks."
      : "The tracks will be prepended if there is an existing playlist.";


  if (!props.showConfig) {
    return "";
  }

  return (
    <div className="pt-2 mt-2 border-top border-bottom">
        <div className="input-group mb-1 ">
            <div className="input-group-prepend">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{type}</button>
                <div className="dropdown-menu">
                    <a className="dropdown-item" href="#" onClick={_ => setConfig('amountType', 'count')}>Trackcount</a>
                    <a className="dropdown-item" href="#" onClick={_ => setConfig('amountType', 'minutes')}>Minutes</a>
                </div>
            </div>
            <input type="text" className="form-control" onChange={handleChange} aria-label="Text input with dropdown button" value={value}/>
        </div>
        <small id="shuffleTypeHelp" className="mt-0 mb-3 form-text text-muted">The playlist will be filled with {sentenceValue} {sentence}</small>

        <div className="form-group form-check custom-switch">
            <input type="checkbox" className="custom-control-input" id="purgeOnShuffle" onChange={handlePurgeChange} checked={props.config.purgeOnShuffle} />
            <label className="custom-control-label" htmlFor="purgeOnShuffle">Purge playlist</label>
            <small id="purgeHelp" className="form-text text-muted">{purgeSentence}</small>
        </div>

        <div className="form-group">
            <label htmlFor="playlistName">Playlist name</label>
            <input type="email" className="form-control" id="playlistName" aria-describedby="playlistNameHelp" placeholder="Playlist name" onChange={handlePlaylistNameChange} value={props.config.randomListName} />
            <small id="playlistNameHelp" className="form-text text-muted">The random playlist will be called "{props.config.randomListName}".</small>
        </div>
    </div>
  );
}

const mapStateToProps = ({data}) => {
    return {
      config: data.config,
      showConfig: data.showConfig,
      user: data.user,
    };
}

export default connect(mapStateToProps, { setConfig })(memo(Configuration));
