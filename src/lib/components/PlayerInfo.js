import React, { memo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { choosePlayer, retrievePlayerInfo, signOut } from '../actions';

const PlayerInfo = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery('playerinfo', retrievePlayerInfo, {
    refetchInterval: 5000 + Math.random() * 1000,
  });

  const selectPlayer = useMutation(choosePlayer, {
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

  useEffect(() => {
    if (isError && error?.response?.status === 401) {
      signOut();
      queryClient.setQueryData('token', () => null);
    }
  }, [error, isError, queryClient]);

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

function mapStateToProps({ auth }) {
  return {
    authenticated: auth,
  };
}

export default memo(PlayerInfo);
