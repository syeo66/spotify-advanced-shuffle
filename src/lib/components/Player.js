import React, { Component } from 'react';
import { connect } from 'react-redux';
import { retrievePlayState } from '../actions';
import analyze from 'rgbaster';
import Color from 'color';

class Player extends Component {
    oldImage = null;

    constructor (props) {
      super(props);
      this.state = {
        color: "rgb(30,30,30)",
        secondary: "rgb(200,200,200)"
      }
    }

    componentDidMount() {
      this.props.retrievePlayState(this.props.authenticated);
      this.polling = setInterval(_ => this.props.retrievePlayState(this.props.authenticated), 2941);
    }

    componentWillUnmount() {
      clearInterval(this.polling);
      this.polling = null;
    }

    componentWillReceiveProps(nextProps) {
      const item = nextProps.playstate.item;
      if (
        item
        && item.album
        && item.album.images[0]
        && item.album.images[0].url !== this.oldImage
        ) {
          analyze(item.album.images[0].url, {
            scale: 0.4,
          }).then(colors => {
            const primary = colors[0].color;
            const secondary = colors.reduce((acc, c) =>  {
              if (acc === null
                && c.color !== primary.color
                && Color(primary).contrast(Color(c.color)) > 7) {
                return c;
              }
              return acc;
            }, null);
            return this.setState({color: colors[0].color, secondary: secondary ? secondary.color : Color(primary).isLight() ? 'rgb(30,30,30)' : 'rgb(240,240,240)'})
          });
          this.oldImage = item.album.images[0].url;
      }
    }

    render() {
      const item = this.props.playstate.item;
      const played = item && item.duration_ms ? Math.round(100 * this.props.playstate.progress_ms / item.duration_ms) : 0;
      const image = item && item.album.images[0] ? {
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,.1) 50%, rgba(255,255,255,0)), url(" + item.album.images[0].url + ")",
          transition: "background 5s linear",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "50% " + played + "%",
        } : {};
      const playClass = this.props.playstate.is_playing ? "fas fa-pause" : "fas fa-play";
      const itemName = item && item.name ? item.name : '';
      const artistName = item && item.artists[0].name ? item.artists[0].name : '';
      const albumName = item && item.album.name ? item.album.name : '';

      return (
        <div className="my-3 border shadow rounded p-3 player" style={image}>
          <div className="d-flex flex-row mb-2">
            <button className="btn btn-primary mr-2 player__player-button" style={{
              color: this.state.secondary,
              backgroundColor: this.state.color,
              border: "1px solid " + this.state.color,
              boxShadow: "0 0 5px " + this.state.secondary,
            }}><i className={playClass}></i></button>
            <div className="" style={{color: this.state.secondary}}>
              <small style={{
                textShadow:"0 0 10px " + this.state.color + ", 0 0 5px " + this.state.color + ', 0 0 3px ' + this.state.color,
              }}><strong>{itemName}</strong><br />
              {artistName} - {albumName}</small>
            </div>
          </div>
          <div className="progress player__player-progress" style={{border: "1px solid " + this.state.color, boxShadow: "0 0 5px " + this.state.secondary, backgroundColor: this.state.secondary}}>
            <div className="progress-bar" role="progressbar" style={{width: played + "%", backgroundColor: this.state.color}} aria-valuenow={played} aria-valuemin="0" aria-valuemax={100}></div>
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
