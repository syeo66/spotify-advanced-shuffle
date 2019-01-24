import React, { Component } from 'react';
import { connect } from 'react-redux';
import ShuffleButton from './ShuffleButton';
import ConfigButton from './ConfigButton';
import Configuration from './Configuration';

class Tools extends Component {
    render() {
        const text = !this.props.library ||  this.props.current < this.props.librarySize ? (
            <div className="mt-2 text-muted"><i className="fas fa-sync fa-spin"></i> Synchronizing...</div>
        ) : "";
        return (
            <div className="mb-3 shadow border p-3 rounded">
                <div className="d-flex justify-content-between">
                    <ShuffleButton />
                    <ConfigButton />
                </div>
                <Configuration />
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

