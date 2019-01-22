import React, { Component } from 'react';
import { connect } from 'react-redux';
import { retrievePlayerInfo } from '../actions';

class PlayerInfo extends Component {
    componentDidMount() {
        this.props.retrievePlayerInfo(this.props.authenticated);
        this.choosePlayer = this.choosePlayer.bind(this);
        this.polling = setInterval(_ => this.props.retrievePlayerInfo(this.props.authenticated), 3000);
    }

    componentWillUnmount() {
        clearInterval(this.polling);
        this.polling = null;
    }

    choosePlayer(id) {
        const authenticated = this.props.authenticated;
        const url = "https://api.spotify.com/v1/me/player";
        fetch(url, {
            method: 'put', 
            headers: new Headers({
                'Authorization': 'Bearer '+authenticated
            }),
            body: JSON.stringify({
                device_ids: [id],
            })
        })
        .then(_ => {});
    }

    render() {
        if (!this.props.devices || !this.props.devices.length) {
            return (
                <div className="alert alert-danger my-3 shadow" role="alert">
                    Sorry, could not find any devices! Please make sure Spotify is running.
                </div>
            );
        }

        const devices = this.props.devices
            .sort((a,b) => {return a.name.toUpperCase()<b.name.toUpperCase() ? -1 : 1})
            .map(entry => {
                    const classe = "list-group-item list-group-item-action";
                    const activeClass = classe + (entry.is_active ? " active" : "");
                    return (
                        <a className={activeClass} href="#" onClick={_ => this.choosePlayer(entry.id)} key={entry.id}>{entry.name}</a>
                    );
                });

        return (
            <div className="list-group my-3 shadow rounded">
                {devices}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        authenticated: state.auth,
        devices: state.data.devices ? state.data.devices : [],
    };
}

export default connect(mapStateToProps, { retrievePlayerInfo })(PlayerInfo);