import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setConfig } from '../actions';

class Configuration extends Component {
    constructor(props) {
        super(props);
        this.state = {defaultsLoaded: false};
        this.setConfig = this.setConfig.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handlePlaylistNameChange = this.handlePlaylistNameChange.bind(this);
        this.handlePurgeChange = this.handlePurgeChange.bind(this);
    }

    componentDidUpdate() {
        this.loadDefaults();
    }

    loadDefaults() {
        if (this.state.defaultsLoaded || !this.props.user) {
            return;
        }
        if (typeof(Storage) !== "undefined") {
            const userId = this.props.user.id;
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
                    this.setConfig(key, value);
                }
            });
        }
        this.setState({...this.state, defaultsLoaded:true});
    }

    setConfig(key, value) {
        this.props.setConfig(key, value);
        if (typeof(Storage) !== "undefined") {
            const userId = this.props.user.id;
            window.localStorage.setItem(userId+'.'+key, value);
        }
    }

    handlePurgeChange() {
        this.setConfig('purgeOnShuffle', !this.props.config.purgeOnShuffle);
    }

    handleChange(event) {
        const value = parseInt(event.target.value) || '';
        const key = this.props.config.amountType == 'minutes'
            ? 'trackMinutes' : 'trackCount';
        const maxValue = this.props.config.amountType == 'minutes'
            ? 1500 : 500;
        this.setConfig(key, Math.max(Math.min(value, maxValue), 0));
    }

    handlePlaylistNameChange(event) {
        const input = event.target.value.trim();
        const value = input || 'Advanced Shuffle';
        this.setConfig('randomListName', value);
    }

    render() {
        if (!this.props.showConfig) {
            return "";
        }

        const type = this.props.config.amountType == 'minutes' ? 'Minutes' : 'Trackcount';
        const value = this.props.config.amountType == 'minutes'
            ? this.props.config.trackMinutes
            : this.props.config.trackCount;
        const sentence = this.props.config.amountType == 'minutes' ? 'hours of music.' : 'random tracks.';
        const sentenceValue = this.props.config.amountType == 'minutes'
            ? Math.round(value / 60 * 100) / 100
            : value;
        const purgeSentence = this.props.config.purgeOnShuffle
            ? "An existing playlist will be purged before adding new tracks."
            : "The tracks will be prepended if there is an existing playlist.";

        return (
            <div className="pt-2 mt-2 border-top border-bottom">
                <div className="input-group mb-1 ">
                    <div className="input-group-prepend">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{type}</button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="#" onClick={_ => this.setConfig('amountType', 'count')}>Trackcount</a>
                            <a className="dropdown-item" href="#" onClick={_ => this.setConfig('amountType', 'minutes')}>Minutes</a>
                        </div>
                    </div>
                    <input type="text" className="form-control" onChange={this.handleChange} aria-label="Text input with dropdown button" value={value}/>
                </div>
                <small id="shuffleTypeHelp" className="mt-0 mb-3 form-text text-muted">The playlist will be filled with {sentenceValue} {sentence}</small>

                <div className="form-group form-check custom-switch">
                    <input type="checkbox" className="custom-control-input" id="purgeOnShuffle" onChange={this.handlePurgeChange} checked={this.props.config.purgeOnShuffle} />
                    <label className="custom-control-label" htmlFor="purgeOnShuffle">Purge playlist</label>
                    <small id="purgeHelp" className="form-text text-muted">{purgeSentence}</small>
                </div>

                <div className="form-group">
                    <label htmlFor="playlistName">Playlist name</label>
                    <input type="email" className="form-control" id="playlistName" aria-describedby="playlistNameHelp" placeholder="Playlist name" onChange={this.handlePlaylistNameChange} value={this.props.config.randomListName} />
                    <small id="playlistNameHelp" className="form-text text-muted">The random playlist will be called "{this.props.config.randomListName}".</small>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state.data;
}

export default connect(mapStateToProps, { setConfig })(Configuration);
