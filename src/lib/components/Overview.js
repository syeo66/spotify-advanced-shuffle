import { addToLoadQueue, markDb, doPurgeDb, retrieveLibrary, retrieveUserData, getToken } from '../actions';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';

import db from '../database';
import { usePrevProps } from '../hooks';
import Fallback from './Fallback';

const PlayerInfo = lazy(() => import('./PlayerInfo'));
const Player = lazy(() => import('./Player'));
const PlaylistList = lazy(() => import('./PlaylistList'));
const Progress = lazy(() => import('./Progress'));
const Tools = lazy(() => import('./Tools'));
const TrackList = lazy(() => import('./TrackList'));
const UserInfo = lazy(() => import('./UserInfo'));

const Overview = (props) => {
  const prevProps = usePrevProps(props);
  const authenticated = useQuery('token', getToken);

  const initDb = useCallback(() => {
    props.markDb();
    props.addToLoadQueue('https://api.spotify.com/v1/me/tracks?limit=50', true);
  }, [props.markDb, props.addToLoadQueue]);

  useEffect(() => {
    if (db.isOpen) {
      initDb();
      return;
    }
    db.on('ready', initDb);
  }, [initDb]);

  useEffect(() => {
    const isAuthenticated = authenticated;

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
  }, [authenticated, props.loadQueue, prevProps]);

  return (
    <div>
      <div className="row py-2">
        <div className="col">
          <Suspense fallback={<Fallback />}>
            <Progress />
          </Suspense>
        </div>
      </div>
      <div className="row py-1">
        <div className="col-md-4">
          <Suspense fallback={<Fallback />}>
            <Tools />
          </Suspense>

          <Suspense fallback={<Fallback />}>
            <Player />
          </Suspense>

          <Suspense fallback={<Fallback />}>
            <PlayerInfo />
          </Suspense>

          <Suspense fallback={<Fallback />}>
            <UserInfo />
          </Suspense>

          <Suspense fallback={<Fallback />}>
            <PlaylistList />
          </Suspense>
        </div>
        <div className="col-md-8">
          <Suspense fallback={<Fallback />}>
            <TrackList />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

Overview.propTypes = {
  markDb: PropTypes.func.isRequired,
  addToLoadQueue: PropTypes.func.isRequired,
  doPurgeDb: PropTypes.func.isRequired,
  retrieveLibrary: PropTypes.func.isRequired,
  retrieveUserData: PropTypes.func.isRequired,
  loadQueue: PropTypes.array.isRequired,
  authenticated: PropTypes.string,
};

function mapStateToProps({ data }) {
  return {
    loadQueue: data.loadQueue ? data.loadQueue : [],
  };
}

export default connect(mapStateToProps, {
  addToLoadQueue,
  markDb,
  doPurgeDb,
  retrieveLibrary,
  retrieveUserData,
})(Overview);
