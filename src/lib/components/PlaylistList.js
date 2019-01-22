import React, { Component } from 'react';
import { connect } from 'react-redux';
import { retrievePlaylists } from '../actions';


class PlaylistList extends Component {
    componentDidMount() {
        this.props.retrievePlaylists(this.props.authenticated);
        this.polling = setInterval(_ => this.props.retrievePlaylists(this.props.authenticated), 4900);
    }

    componentWillUnmount() {
        clearInterval(this.polling);
        this.polling = null;
    }

    render() {
        const playlists = this.props.playlists
            .sort((a,b) => {return a.name.toUpperCase()<b.name.toUpperCase() ? -1 : 1})
            .map(entry => {
                return (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={entry.id}>
                        {entry.name}
                        <span className="badge badge-primary badge-pill">{entry.tracks.total}</span>
                    </li>
                );
            });

        return (
            <ul className="list-group my-3 shadow rounded">
                {playlists}
            </ul>
        );
    };
}

function mapStateToProps(state) {
    return {
        authenticated: state.auth,
        playlists: state.data.playlists ? state.data.playlists : [],
        playlistsSize: state.data.playlistsSize ? state.data.playlistsSize : 0,
    }
}

export default connect(mapStateToProps, { retrievePlaylists })(PlaylistList);