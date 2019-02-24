import React, { Component } from 'react';

class ProgressBar extends Component {
    render() {
        const progressPercent = (100 * this.props.current / this.props.target)  + "%";
        return (
            <div className="progress mb-1">
                <div
                    className="progress-bar"
                    role="progressbar"
                    style={{width:progressPercent}}
                    aria-valuenow={this.props.target}
                    aria-valuemin="0"
                    aria-valuemax={this.props.target}
                    >{this.props.current}/{this.props.target}</div>
            </div>
        );
    }
}

export default ProgressBar;
