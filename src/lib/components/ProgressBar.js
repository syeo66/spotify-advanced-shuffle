import React, { memo } from 'react';

const ProgressBar = props => {
  const progressPercent = (100 * props.current / props.target)  + "%";
  const barStyle = {width:progressPercent};

  return (
      <div className="progress mb-1">
          <div
              className="progress-bar"
              role="progressbar"
              style={barStyle}
              aria-valuenow={props.target}
              aria-valuemin="0"
              aria-valuemax={props.target}
              >{props.current}/{props.target}</div>
      </div>
  );
}

export default memo(ProgressBar);
