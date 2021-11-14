import PropTypes from 'prop-types';
import React, { lazy, memo, Suspense, useCallback, useState } from 'react';
import { connect } from 'react-redux';

import Fallback from './Fallback';

const ShuffleButton = lazy(() => import('./ShuffleButton'));
const ConfigButton = lazy(() => import('./ConfigButton'));
const Configuration = lazy(() => import('./Configuration'));

const Tools = (props) => {
  const [showConfig, setShowConfig] = useState(false);

  const { isLoaded } = props || {};

  const toggleConfig = useCallback(() => setShowConfig((c) => !c), []);

  const text = !isLoaded ? (
    <div className="mt-2 text-muted">
      <i className="fas fa-sync fa-spin" /> Synchronizing...
    </div>
  ) : (
    ''
  );
  return (
    <div className="mb-3 shadow border p-3 rounded">
      <div className="d-flex justify-content-between">
        <Suspense fallback={<Fallback />}>
          <ShuffleButton />
        </Suspense>

        <Suspense fallback={<Fallback />}>
          <ConfigButton active={showConfig} onClick={toggleConfig} />
        </Suspense>
      </div>
      <Suspense fallback={<Fallback />}>
        <Configuration active={showConfig} />
      </Suspense>
      {text}
    </div>
  );
};

Tools.propTypes = {
  isLoaded: PropTypes.bool.isRequired,
};

function mapStateToProps({ data }) {
  return {
    isLoaded: data.loadQueue.reduce((acc, queue) => acc && queue.isLoaded, true),
    showConfig: data.showConfig,
  };
}

export default connect(mapStateToProps, {})(memo(Tools));
