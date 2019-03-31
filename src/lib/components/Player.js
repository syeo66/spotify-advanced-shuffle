import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { retrievePlayState } from '../actions';
import analyze from 'rgbaster';
import Color from 'color';
import greenlet from 'greenlet';

const Player = props => {
  const [primaryColor, setPrimaryColor] = useState("rgb(30,30,30)");
  const [secondaryColor, setSecondaryColor] = useState("rgb(200,200,200)");
  const [tertiaryColor, setTertiaryColor] = useState("rgb(190,190,190)");

  useEffect(() => {
    props.retrievePlayState(props.authenticated);
    const polling = setInterval(_ => props.retrievePlayState(props.authenticated), 2000 + Math.floor(Math.random() * 1000));
    return () => clearInterval(polling);
  }, []);

  useEffect(() => {
    const item = props.playstate.item;
    if (
      item
      && item.album
      && item.album.images[0]
      ) {
        const webworkerAnalyze = greenlet(async (url) => {
          const colors = await analyze(url, {
            scale: 0.6,
          });
          return colors;
        });

        webworkerAnalyze(item.album.images[0].url).then(colors => {
          const primary = colors[0].color;

          const secondary = colors.reduce((acc, c) =>  {
            if (acc === null
              && c.color !== primary.color
              && Color(c.color).chroma() > 20
              && Color(primary).contrast(Color(c.color)) > 4
              ) {
              return c;
            }
            return acc;
          }, null);

          const tertiary = colors.reduce((acc, c) =>  {
            if (acc === null
              && c.color !== primary.color
              && Color('#fff').contrast(Color(c.color)) > 1
              && Color('#000').contrast(Color(c.color)) > 1
              && Color(primary).contrast(Color(c.color)) > 10) {
              return c;
            }
            return acc;
          }, null);

          setPrimaryColor(colors[0].color);
          setSecondaryColor(secondary ? secondary.color : tertiary
            ? tertiary.color
            : (Color(primary).isLight() ? 'rgb(30,30,30)' : 'rgb(240,240,240)'));
          setTertiaryColor(tertiary ? tertiary.color :
            secondary ? (Color(primary).isLight()
              ? Color(secondary.color).darken(.3).hex() : Color(secondary.color).lighten(.3).hex())
              : Color(primary).isLight() ? 'rgb(30,30,30)' : 'rgb(240,240,240)');
        });
    }
  }, [props.playstate.item ? props.playstate.item.album.images[0].url : null]);

  const item = props.playstate.item;
  const played = item && item.duration_ms ? Math.round(100 * props.playstate.progress_ms / item.duration_ms) : 0;
  const image = item && item.album.images[0] ? {
      backgroundImage: "linear-gradient(to right, rgba(255,255,255,.1) 50%, rgba(255,255,255,0)), url(" + item.album.images[0].url + ")",
      transition: "background 5s linear",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "50% " + played + "%",
    } : {};
  const playClass = props.playstate.is_playing ? "fas fa-pause" : "fas fa-play";
  const itemName = item && item.name ? item.name : '';
  const artistName = item && item.artists[0].name ? item.artists[0].name : '';
  const albumName = item && item.album.name ? item.album.name : '';

  return (
    <div className="my-3 border shadow rounded p-3 player" style={image}>
      <div className="d-flex flex-row mb-2">
        <button className="btn btn-primary mr-2 player__player-button" style={{
          color: secondaryColor,
          backgroundColor: primaryColor,
          border: "1px solid " + primaryColor,
          boxShadow: "0 0 5px " + secondaryColor,
        }}><i className={playClass}></i></button>
        <div className="" style={{color: tertiaryColor}}>
          <small style={{
            textShadow:"0 0 10px " + primaryColor + ", 0 0 5px " + primaryColor + ', 0 0 3px ' + primaryColor,
          }}><strong>{itemName}</strong><br />
          {artistName} - {albumName}</small>
        </div>
      </div>
      <div className="progress player__player-progress" style={{border: "1px solid " + primaryColor, boxShadow: "0 0 5px " + secondaryColor, backgroundColor: secondaryColor}}>
        <div className="progress-bar" role="progressbar" style={{width: played + "%", backgroundColor: primaryColor}} aria-valuenow={played} aria-valuemin="0" aria-valuemax={100}></div>
      </div>
    </div>
  );
}

function mapStateToProps({auth, data}) {
  return {
    authenticated: auth,
    playstate: data.playstate ? data.playstate : [],
  };
}

export default connect(mapStateToProps, { retrievePlayState })(Player);
