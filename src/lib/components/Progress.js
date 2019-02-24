import React, { Component } from 'react';
import { connect } from 'react-redux';
import ProgressBar from './ProgressBar.js';

class Progress extends Component {
  render() {
    return (
      <React.Fragment>
        {this.props.loadQueue.map((queue, i) => {
          if (queue.isLoaded) {
            return '';
          }
          return <ProgressBar key={queue.origUrl} current={queue.current} target={queue.size} />
          })
        }
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loadQueue: state.data.loadQueue,
  }
}

export default connect(mapStateToProps, { })(Progress);
