import React, { lazy, Component, Suspense } from 'react';
import {
  addToLoadQueue,
  markDb,
  doPurgeDb,
  retrieveLibrary,
  retrieveUserData,
} from '../actions';
import { connect } from 'react-redux';

import db from '../database';

const Tools = lazy(() => import('./Tools'));
const Player = lazy(() => import('./Player'));
const PlayerInfo = lazy(() => import('./PlayerInfo'));
const UserInfo = lazy(() => import('./UserInfo'));
const PlaylistList = lazy(() => import('./PlaylistList'));
const TrackList = lazy(() => import('./TrackList'));
const Progress = lazy(() => import('./Progress'));

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

      const isAllLoaded = this.props.loadQueue.reduce((acc, queue) => queue.isLoaded && acc, true);
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
            <Suspense fallback={(<div className="mb-3 shadow border p-3 rounded" />)}>
              <Progress />
            </Suspense>
          </div>
        </div>
        <div className="row py-1">
          <div className="col-md-4">
            <Suspense fallback={(<div className="mb-3 shadow border p-3 rounded" />)}>
              <Tools />
            </Suspense>

            <Suspense fallback={(<div className="mb-3 shadow border p-3 rounded" />)}>
              <Player />
            </Suspense>

            <Suspense fallback={(<div className="mb-3 shadow border p-3 rounded" />)}>
              <PlayerInfo />
            </Suspense>

            <Suspense fallback={(<div className="mb-3 shadow border p-3 rounded" />)}>
              <UserInfo />
            </Suspense>

            <Suspense fallback={(<div className="mb-3 shadow border p-3 rounded" />)}>
              <PlaylistList />
            </Suspense>
          </div>
          <div className="col-md-8">
            <Suspense fallback={(<div className="mb-3 shadow border p-3 rounded" />)}>
              <TrackList />
            </Suspense>
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
