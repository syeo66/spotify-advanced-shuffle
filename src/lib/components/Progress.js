import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { connect } from 'react-redux';

import ProgressBar from './ProgressBar.js';

const Progress = (props) => {
  return (
    <>
      {props.loadQueue.map((queue) => {
        if (queue.isLoaded) {
          return '';
        }
        return <ProgressBar key={queue.origUrl} current={queue.current} target={queue.size} />;
      })}
    </>
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

export default connect(mapStateToProps, {})(memo(Progress));
