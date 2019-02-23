import React, { Component } from 'react';
import { connect } from 'react-redux';
import ProgressBar from './ProgressBar.js';

class Progress extends Component {
    render() {
        return (
            <React.Fragment>
                {this.props.current !== this.props.librarySize &&
                    <ProgressBar current={this.props.current} target={this.props.librarySize} />
                }
            </React.Fragment>
        );
    }
}

function mapStateToProps(state) {
    return {
        library: state.data.library ? state.data.library : [],
        current: state.data.current ? state.data.current : 0,
        librarySize: state.data.librarySize ? state.data.librarySize : 0,
    }
}

export default connect(mapStateToProps, { })(Progress);
