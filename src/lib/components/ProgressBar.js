import React, { Component } from 'react';
import { connect } from 'react-redux';

class ProgressBar extends Component {
    render() {
        const progressPercent = (100*this.props.library.length/this.props.librarySize) + "%";
        return (
            <div className="progress">
                <div className="progress-bar" role="progressbar" style={{width:progressPercent}} aria-valuenow={this.props.library.length} aria-valuemin="0" aria-valuemax={this.props.librarySize}>{this.props.library.length}/{this.props.librarySize}</div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        library: state.data.library ? state.data.library : [],
        librarySize: state.data.librarySize ? state.data.librarySize : 0,
    }
}

export default connect(mapStateToProps, { })(ProgressBar);
