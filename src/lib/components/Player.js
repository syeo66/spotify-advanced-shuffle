import Color from 'color';
import React, { memo, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import analyze from 'rgbaster';
import styled from 'styled-components';

import { retrievePlayState } from '../actions';

const Player = () => {
  const [primaryColor, setPrimaryColor] = useState('rgb(30,30,30)');
  const [secondaryColor, setSecondaryColor] = useState('rgb(200,200,200)');
  const [averageColor, setAverageColor] = useState('rgb(20,20,20)');

  const { data, isError, isLoading } = useQuery('playstate', retrievePlayState, {
    refetchInterval: 2000 + Math.random() * 1000,
  });

  const playStateItemUrl = data?.item ? data?.item?.album?.images?.[0]?.url : null;

  useEffect(() => {
    if (!playStateItemUrl) {
      return;
    }

    analyze(playStateItemUrl, {
      scale: 0.6,
    }).then((colors) => {
      const primary = colors[0].color;

      const average = colors.reduce(
        (acc, v) => {
          const [r, g, b] = v.color.replace(/[^0-9,]/g, '').split(',');
          return {
            r: acc.r + Number(r) * v.count,
            g: acc.g + Number(g) * v.count,
            b: acc.b + Number(b) * v.count,
            sum: acc.sum + v.count,
          };
        },
        { r: 0, g: 0, b: 0, sum: 0 }
      );

      setAverageColor(`rgb(${average.r / average.sum},${average.g / average.sum},${average.b / average.sum})`);

      const secondary = colors.reduce((acc, c) => {
        if (
          acc === null &&
          c.color !== primary.color &&
          Color(c.color).chroma() > 20 &&
          Color(primary).contrast(Color(c.color)) > 4
        ) {
          return c;
        }
        return acc;
      }, null);

      const tertiary = colors.reduce((acc, c) => {
        if (
          acc === null &&
          c.color !== primary.color &&
          Color('#fff').contrast(Color(c.color)) > 1 &&
          Color('#000').contrast(Color(c.color)) > 1 &&
          Color(primary).contrast(Color(c.color)) > 10
        ) {
          return c;
        }
        return acc;
      }, null);

      setPrimaryColor(colors[0].color);
      setSecondaryColor(
        secondary
          ? secondary.color
          : tertiary
          ? tertiary.color
          : Color(primary).isLight()
          ? 'rgb(30,30,30)'
          : 'rgb(240,240,240)'
      );
    });
  }, [playStateItemUrl]);

  if (isError) {
    return <div className="my-3 border shadow rounded p-3">Could not load player data.</div>;
  }

  if (isLoading) {
    return <div className="my-3 border shadow rounded p-3">Loading...</div>;
  }

  const item = data?.item;
  const played = item && item.duration_ms ? Math.round((100 * data.progress_ms) / item.duration_ms) : 0;
  const playClass = data?.is_playing ? 'fas fa-pause' : 'fas fa-play';
  const itemName = item?.name || '';
  const artistName = item?.artists[0].name || '';
  const albumName = item?.album.name || '';

  return (
    <div className="my-3 border shadow rounded p-3 player flex-row d-flex" style={{ backgroundColor: averageColor }}>
      <AlbumImage
        src={item.album.images[0].url}
        alt={albumName}
        style={{
          boxShadow: `0 0 5px ${secondaryColor}`,
        }}
      />
      <PlayerContent>
        <div className="d-flex flex-row mb-2">
          <button
            className="btn btn-primary mr-2 player__player-button"
            style={{
              color: secondaryColor,
              backgroundColor: primaryColor,
              border: `1px solid ${primaryColor}`,
              boxShadow: `0 0 5px ${secondaryColor}`,
            }}
          >
            <i className={playClass} />
          </button>
          <div className="" style={{ color: secondaryColor }}>
            <small
              style={{
                textShadow: `0 0 10px ${primaryColor}, 0 0 5px ${primaryColor}, 0 0 3px ${primaryColor}`,
              }}
            >
              <strong>{itemName}</strong>
              <br />
              {artistName} - {albumName}
            </small>
          </div>
        </div>
        <div
          className="progress player__player-progress"
          style={{
            border: `1px solid ${primaryColor}`,
            boxShadow: `0 0 5px ${secondaryColor}`,
            backgroundColor: secondaryColor,
          }}
        >
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${played}%`, backgroundColor: primaryColor }}
            aria-valuenow={played}
            aria-valuemin="0"
            aria-valuemax={100}
          />
        </div>
      </PlayerContent>
    </div>
  );
};

const PlayerContent = styled.div`
  width: 100%;
`;

const AlbumImage = styled.img`
  width: 100px;
  margin-right: 1rem;
`;

export default memo(Player);
