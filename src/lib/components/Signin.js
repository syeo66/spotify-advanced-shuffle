import React, { Component } from 'react';
import { connect } from 'react-redux';
import { signInWithSpotify, doLogin } from '../actions';
import PropTypes from "prop-types";

class Signin extends Component {
    static contextTypes = {
        router: PropTypes.object
    }

    componentDidMount() {
        if (typeof(Storage) !== "undefined") {
            const access_token = window.localStorage.getItem('access_token');
            if (access_token) {
                this.props.doLogin(access_token);
            }
        }
    }

    componentDidUpdate() {
        if (this.props.auth) {
            this.context.router.history.push('/app');
            return;
        }
    }

    render() {
        return (
            <div className="row justify-content-center py-5">
                <div className="col-auto py-5 shadow border rounded">
                    <a href="#" className="btn btn-success" onClick={this.props.signInWithSpotify}>
                        <i className="fab fa-spotify" />&nbsp;Sign In With Spotify
                    </a>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ auth }) {
    return { auth };
}

export default connect(mapStateToProps, { signInWithSpotify, doLogin })(Signin);
