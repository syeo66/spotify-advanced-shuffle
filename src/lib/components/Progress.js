import React, { memo } from 'react';
import { connect } from 'react-redux';
import ProgressBar from './ProgressBar.js';
import PropTypes from 'prop-types';

const Progress = props => {
  return (
    <React.Fragment>
      {props.loadQueue.map(queue => {
        if (queue.isLoaded) {
          return '';
        }
        return <ProgressBar key={queue.origUrl} current={queue.current} target={queue.size} />;
      })}
    </React.Fragment>
  );
};

Progress.propTypes = {
  loadQueue: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return {
    loadQueue: state.data.loadQueue,
  };
}

export default connect(
  mapStateToProps,
  {}
)(memo(Progress));
