import React, { lazy, Suspense } from 'react';

import Fallback from './Fallback';

const PlayerInfo = lazy(() => import('./PlayerInfo'));
const Player = lazy(() => import('./Player'));
const PlaylistList = lazy(() => import('./PlaylistList'));
const Progress = lazy(() => import('./Progress'));
const Tools = lazy(() => import('./Tools'));
const TrackList = lazy(() => import('./TrackList'));
const UserInfo = lazy(() => import('./UserInfo'));

const Overview = () => {
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

Overview.propTypes = {};

export default Overview;
