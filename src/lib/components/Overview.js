import React, { lazy, Suspense, useEffect } from 'react';
import {
  addToLoadQueue,
  markDb,
  doPurgeDb,
  retrieveLibrary,
  retrieveUserData,
} from '../actions';
import { connect } from 'react-redux';
import { usePrevProps } from '../hooks';

import db from '../database';

const Tools = lazy(() => import('./Tools'));
const Player = lazy(() => import('./Player'));
const PlayerInfo = lazy(() => import('./PlayerInfo'));
const UserInfo = lazy(() => import('./UserInfo'));
const PlaylistList = lazy(() => import('./PlaylistList'));
const TrackList = lazy(() => import('./TrackList'));
const Progress = lazy(() => import('./Progress'));

const Overview = props => {
  const prevProps = usePrevProps(props);

  const initDb = () => {
    props.markDb();
    props.addToLoadQueue('https://api.spotify.com/v1/me/tracks?limit=50', true);
  }

  useEffect(() => {
    if (db.isOpen) {
      initDb();
      return;
    }
    db.on('ready', initDb);
  }, []);

  useEffect(() => {
    const isAuthenticated = props.authenticated;

    if (isAuthenticated && prevProps) {
      for (let index in props.loadQueue) {
        const queue = props.loadQueue[index];
        if ((prevProps.loadQueue && queue === prevProps.loadQueue[index]) || queue.isLoaded) {
          continue;
        }
        props.retrieveLibrary(props.authenticated, queue);
      }

      const isAllLoaded = prevProps && props.loadQueue.reduce((acc, queue) => queue.isLoaded && acc, true);
      if (isAllLoaded) {
        props.doPurgeDb();
      }
    }
  }, [props.authenticated, props.loadQueue, prevProps]);

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

function mapStateToProps({data}) {
  return {
    loadQueue: data.loadQueue ? data.loadQueue : [],
  }
}

export default connect(mapStateToProps, {
  addToLoadQueue,
  markDb,
  doPurgeDb,
  retrieveLibrary,
  retrieveUserData,
})(Overview);
