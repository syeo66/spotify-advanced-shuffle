import React, { lazy, memo, Suspense } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const ShuffleButton = lazy(() => import('./ShuffleButton'));
const ConfigButton = lazy(() => import('./ConfigButton'));
const Configuration = lazy(() => import('./Configuration'));

const Tools = props => {
  const isLoaded = props.isLoaded;
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
        <Suspense fallback={<div />}>
          <ShuffleButton />
        </Suspense>

        <Suspense fallback={<div />}>
          <ConfigButton />
        </Suspense>
      </div>
      <Suspense fallback={<div />}>
        <Configuration />
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

export default connect(
  mapStateToProps,
  {}
)(memo(Tools));
