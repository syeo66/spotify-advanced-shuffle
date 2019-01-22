import React, { Component } from 'react';
import { connect } from 'react-redux';
import { retrieveUserData } from '../actions';
import Signout from './Signout';

class UserInfo extends Component {
    componentDidMount() {
        this.props.retrieveUserData(this.props.authenticated);
    }

    render() {
        return (
            <div className="my-3 border shadow rounded p-3">
                <div className="row">
                    <div className="col-3 m-0 pr-0"><img className="img-thumbnail" src={this.props.user.images[0].url} /></div>
                    <div className="col pt-0 pb-0 pl-2 mt-n1">
                        <small>{this.props.user.display_name}</small><br/>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state.data.user ? {
        authenticated: state.auth,
        user: state.data.user
    } : {
        authenticated: state.auth,
        user: {
            display_name: 'Loading...',
            images: [
                {url:''},
            ],
        }
    }
}

export default connect(mapStateToProps, { retrieveUserData })(UserInfo);