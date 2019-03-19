import React, { lazy, Component, Suspense } from 'react';
import { connect } from 'react-redux';

const ShuffleButton = lazy(() => import('./ShuffleButton'));
const ConfigButton = lazy(() => import('./ConfigButton'));
const Configuration = lazy(() => import('./Configuration'));

class Tools extends Component {
  render() {
    const isLoaded = this.props.loadQueue.reduce((acc, queue) => acc && queue.isLoaded, true);
    const text = !isLoaded ? (
      <div className="mt-2 text-muted"><i className="fas fa-sync fa-spin"></i> Synchronizing...</div>
    ) : "";
    return (
      <div className="mb-3 shadow border p-3 rounded">
        <div className="d-flex justify-content-between">
          <Suspense fallback={(<div />)}>
            <ShuffleButton />
          </Suspense>

          <Suspense fallback={(<div />)}>
            <ConfigButton />
          </Suspense>
        </div>
        <Suspense fallback={(<div />)}>
          <Configuration />
        </Suspense>
        {text}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.data,
    authenticated: state.auth,
  }
}

export default connect(mapStateToProps, {})(Tools);

