import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { choosePlayer, retrievePlayerInfo } from '../actions';

const PlayerInfo = (props) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery('playerinfo', retrievePlayerInfo(props.authenticated), {
    refetchInterval: 5000,
  });

  const selectPlayer = useMutation(choosePlayer(props.authenticated), {
    onMutate: async (id) => {
      await queryClient.cancelQueries('playerinfo');
      const prev = queryClient.getQueryData('playerinfo');
      queryClient.setQueryData('playerinfo', (old) => {
        return { ...old, devices: old.devices?.map((e) => ({ ...e, is_active: e.id === id })) };
      });
      return { prev };
    },
    onSuccess: () => {
      queryClient.invalidateQueries('playerinfo');
    },
  });

  if (isLoading) {
    return <div className="my-3 border shadow rounded p-3">Loading...</div>;
  }

  if (!data?.devices?.length || isError) {
    return (
      <div className="alert alert-danger my-3 shadow" role="alert">
        Sorry, could not find any devices! Please make sure Spotify is running.
      </div>
    );
  }

  const devices = data.devices
    .sort((a, b) => {
      return a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1;
    })
    .map((entry) => {
      const classe = 'list-group-item list-group-item-action';
      const activeClass = classe + (entry.is_active ? ' active' : '');

      return (
        <a className={activeClass} href="#" onClick={() => selectPlayer.mutate(entry.id)} key={entry.id}>
          {entry.name}
        </a>
      );
    });

  return <div className="list-group my-3 shadow rounded">{devices}</div>;
};

PlayerInfo.propTypes = {
  authenticated: PropTypes.string,
};

function mapStateToProps({ auth }) {
  return {
    authenticated: auth,
  };
}

export default connect(mapStateToProps, {})(PlayerInfo);
