import React, { memo } from 'react';
import { connect } from 'react-redux';
import ProgressBar from './ProgressBar.js';

const Progress = props => {
  return (
    <React.Fragment>
      {props.loadQueue.map((queue, i) => {
        if (queue.isLoaded) {
          return '';
        }
        return <ProgressBar key={queue.origUrl} current={queue.current} target={queue.size} />;
      })}
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    loadQueue: state.data.loadQueue
  };
}

export default connect(
  mapStateToProps,
  {}
)(memo(Progress));
