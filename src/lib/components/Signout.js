import React, { Component } from 'react';
import { connect } from 'react-redux';
import { signOut } from '../actions';

class Signout extends Component {
    render() {
        if (!this.props.auth) {
            return "";
        }
        return (
            <a href="#" className="btn btn-primary btn-sm" onClick={this.props.signOut}>
                <i className="fas fa-sign-out-alt" />&nbsp;Signout
            </a>
        );
    }
} 

function mapStateToProps({ auth }) {
    return { auth };
}

export default connect(mapStateToProps, { signOut })(Signout);
