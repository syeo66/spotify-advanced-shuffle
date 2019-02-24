import React, { Component } from 'react';
import {
  markDb,
  retrieveLibrary,
  retrieveUserData,
} from '../actions';
import { connect } from 'react-redux';
import UserInfo from './UserInfo';
import TrackList from './TrackList';
import PlaylistList from './PlaylistList';
import Tools from './Tools';
import Progress from './Progress';
import PlayerInfo from './PlayerInfo';
import Player from './Player';
import db from '../database';

class Overview extends Component {
  componentDidMount() {
    if (db.isOpen) {
      this.initDb();
      return;
    }
    db.on('ready', this.initDb);
  }

  componentDidUpdate(prevState) {
    if (this.props.authenticated
      && this.props.loadNext
      && prevState.loadNext != this.props.loadNext) {
      this.props.retrieveLibrary(this.props.authenticated, this.props.loadNext);
    }
  }

  initDb = () => {
    this.props.markDb();
    this.props.retrieveLibrary(this.props.authenticated);
  }

  render() {
    return (
      <div>
        <div className="row py-2">
          <div className="col">
            <Progress />
          </div>
        </div>
        <div className="row py-1">
          <div className="col-md-4">
            <Tools />
            <Player />
            <PlayerInfo />
            <UserInfo />
            <PlaylistList />
          </div>
          <div className="col-md-8">
            <TrackList />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return state.data.user ? {
    user: state.data.user,
    loadNext: state.data.loadNext ? state.data.loadNext : false,
  } : {
    user: {
        display_name: 'Loading...'
    }
  }
}

export default connect(mapStateToProps, {
  markDb,
  retrieveLibrary,
  retrieveUserData,
})(Overview);
