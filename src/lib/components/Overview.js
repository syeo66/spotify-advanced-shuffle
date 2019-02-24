import React, { Component } from 'react';
import {
  addToLoadQueue,
  markDb,
  doPurgeDb,
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

  componentDidUpdate(prevProps) {
    const isAuthenticated = this.props.authenticated;
    const isQueueChanged = prevProps.loadQueue !== this.props.loadQueue;

    if (isAuthenticated && isQueueChanged) {
      for (let index in this.props.loadQueue) {
        const queue = this.props.loadQueue[index];
        if ((prevProps.loadQueue && queue === prevProps.loadQueue[index]) || queue.isLoaded) {
          continue;
        }
        this.props.retrieveLibrary(prevProps.authenticated, queue);
      }

      const isAllLoaded = prevProps.loadQueue
        ? prevProps.loadQueue.reduce((acc, queue) => queue.isLoaded && acc, true)
        : false;
      if (isAllLoaded) {
        this.props.doPurgeDb();
      }
    }
  }

  initDb = () => {
    this.props.markDb();
    this.props.addToLoadQueue('https://api.spotify.com/v1/me/tracks?limit=50', true);
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
    loadQueue: state.data.loadQueue ? state.data.loadQueue : [],
    checkedPlaylists: state.data.checkedPlaylists ? state.data.checkedPlaylists : [],
  } : {
    user: {
        display_name: 'Loading...'
    }
  }
}

export default connect(mapStateToProps, {
  addToLoadQueue,
  markDb,
  doPurgeDb,
  retrieveLibrary,
  retrieveUserData,
})(Overview);
