import React, { memo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { getToken, signOut } from '../actions';

const Signout = () => {
  const queryClient = useQueryClient();
  const { data: auth } = useQuery('token', getToken);

  const logoff = useMutation(signOut, {
    onSuccess: () => {
      queryClient.invalidateQueries('token');
    },
  });

  if (!auth) {
    return '';
  }

  return (
    <a href="#" className="btn btn-primary btn-sm" onClick={logoff.mutate}>
      <i className="fas fa-sign-out-alt" />
      &nbsp;Signout
    </a>
  );
};

export default memo(Signout);
