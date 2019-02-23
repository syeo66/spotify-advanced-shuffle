import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  setCheckedPlaylists,
  retrievePlaylists,
  setConfig,
  togglePlaylist,
} from '../actions';


class PlaylistList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultsLoaded: false,
    };
  }

  componentDidMount() {
    this.props.retrievePlaylists(this.props.authenticated);
    this.polling = setInterval(_ => this.props.retrievePlaylists(this.props.authenticated), 4900);
  }

  componentWillUpdate() {
    this.loadDefaults();
  }

  loadDefaults() {
    if (this.state.defaultsLoaded || !this.props.user) {
      return;
    }
    if (typeof(Storage) !== "undefined") {
      const userId = this.props.user.id;
      const key = 'checkedPlaylists';
      const rawValue = window.localStorage.getItem(userId + '.' + key);
      const value = rawValue ? JSON.parse(rawValue) : [];
      this.props.setCheckedPlaylists(value);
      this.setState({defaultsLoaded: true});
    }
  }

  componentWillUnmount() {
    clearInterval(this.polling);
    this.polling = null;
  }

  handleClick = (e) => {
    this.props.togglePlaylist(e.target.value, this.props.user.id);
  }

  render() {
    const playlists = this.props.playlists
      .sort((a,b) => {return a.name.toUpperCase()<b.name.toUpperCase() ? -1 : 1})
      .map(entry => {
        return (
          <li className="list-group-item d-flex justify-start align-items-center" key={entry.id}>
            <input
              type="checkbox"
              checked={this.props.checkedPlaylists.indexOf(entry.id) !== -1
                && !(entry.name === this.props.config.randomListName)}
              value={entry.id}
              onChange={this.handleClick}
              disabled={entry.name === this.props.config.randomListName}
              />
            <span className="ml-3 text-left">{entry.name}</span>
            <span className="badge badge-primary badge-pill ml-auto">{entry.tracks.total}</span>
          </li>
        );
      });

    return (
      <ul className="list-group my-3 shadow rounded">
        {playlists}
      </ul>
    );
  };
}

function mapStateToProps(state) {
  return {
    authenticated: state.auth,
    playlists: state.data.playlists ? state.data.playlists : [],
    playlistsSize: state.data.playlistsSize ? state.data.playlistsSize : 0,
    user: state.data.user,
    checkedPlaylists: state.data.checkedPlaylists,
    config: state.data.config,
  }
}

export default connect(mapStateToProps, {
  setCheckedPlaylists,
  retrievePlaylists,
  setConfig,
  togglePlaylist,
})(PlaylistList);
