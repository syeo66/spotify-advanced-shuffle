import React, { Component } from 'react';
import { retrieveUserData } from '../actions';
import { connect } from 'react-redux';
import UserInfo from './UserInfo';
import TrackList from './TrackList';
import PlaylistList from './PlaylistList';
import Tools from './Tools';
import ProgressBar from './ProgressBar';
import PlayerInfo from './PlayerInfo';
import Player from './Player';

class Overview extends Component {
    render() {
        return (
            <div>
                <div className="row py-2">
                    <div className="col">
                        <ProgressBar />
                    </div>
                </div>
                <div className="row py-1">
                    <div className="col-md-4 col-lg-3">
                        <Tools />
                        <Player />
                        <PlayerInfo />
                        <UserInfo />
                        <PlaylistList />
                    </div>
                    <div className="col-md-8 col-lg-9">
                        <TrackList />
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state.data.user ? {
        user: state.data.user
    } : {
        user: {
            display_name: 'Loading...'
        }
    }
}

export default connect(mapStateToProps, { retrieveUserData })(Overview);