import React, { Component } from 'react';
import { connect } from 'react-redux';
import { retrievePlayState } from '../actions';

class Player extends Component {
    componentDidMount() {
        this.props.retrievePlayState(this.props.authenticated);
        this.polling = setInterval(_ => this.props.retrievePlayState(this.props.authenticated), 2941);
    }

    componentWillUnmount() {
        clearInterval(this.polling);
        this.polling = null;
    }

    render() {
        const item = this.props.playstate.item;
        const played = item && item.duration_ms ? Math.round(100 * this.props.playstate.progress_ms / item.duration_ms) : 0;
        const image = item && item.album.images[0] ? {
                backgroundImage: "linear-gradient(to right, rgba(255,255,255,.8) 50%, rgba(255,255,255,0)), url("+item.album.images[0].url+")",
                transition: "background 5s linear",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "50% "+played+"%",
            } : {};
        const playClass = this.props.playstate.is_playing ? "fas fa-pause" : "fas fa-play";
        const itemName = item && item.name ? item.name : '';
        const artistName = item && item.artists[0].name ? item.artists[0].name : '';
        const albumName = item && item.album.name ? item.album.name : '';
        
        return (
            <div className="my-3 border shadow rounded p-3" style={image}>
                <div className="d-flex flex-row mb-2">
                    <button className="btn btn-primary mr-2"><i className={playClass}></i></button>
                    <div className="">
                        <small style={{textShadow:"0 0 7px white"}}><strong>{itemName}</strong><br />
                        {artistName} - {albumName}</small>
                    </div>
                </div>
                <div className="progress">
                    <div className="progress-bar" role="progressbar" style={{width:played+"%"}} aria-valuenow={played} aria-valuemin="0" aria-valuemax={100}></div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        authenticated: state.auth,
        playstate: state.data.playstate ? state.data.playstate : [],
    };
}

export default connect(mapStateToProps, { retrievePlayState })(Player);
