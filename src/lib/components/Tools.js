import React, { lazy, memo, Suspense, useCallback, useState } from 'react';

import Fallback from './Fallback';

const ConfigButton = lazy(() => import('./ConfigButton'));
const Configuration = lazy(() => import('./Configuration'));
const ShuffleButton = lazy(() => import('./ShuffleButton'));
const SyncButton = lazy(() => import('./SyncButton'));

const Tools = () => {
  const [showConfig, setShowConfig] = useState(false);

  const toggleConfig = useCallback(() => setShowConfig((c) => !c), []);

  return (
    <div className="mb-3 shadow border p-3 rounded">
      <div className="d-flex justify-content-between">
        <Suspense fallback={<Fallback />}>
          <ShuffleButton />
        </Suspense>

        <Suspense fallback={<Fallback />}>
          <SyncButton />
        </Suspense>

        <Suspense fallback={<Fallback />}>
          <ConfigButton active={showConfig} onClick={toggleConfig} />
        </Suspense>
      </div>
      <Suspense fallback={<Fallback />}>
        <Configuration active={showConfig} />
      </Suspense>
    </div>
  );
};

Tools.propTypes = {};

export default memo(Tools);
