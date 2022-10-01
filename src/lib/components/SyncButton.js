import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { connect } from 'react-redux';

import { addToLoadQueue, doPurgeDb, getToken, markDb, retrieveLibrary, retrieveUserData } from '../actions';
import { usePrevProps } from '../hooks';

const Overview = (props) => {
  const prevProps = usePrevProps(props);
  const authenticated = useQuery('token', getToken);
  const [syncStarted, setSyncStarted] = useState(false);

  const { markDb, addToLoadQueue, loadQueue, retrieveLibrary, doPurgeDb } = props;
  const { loadQueue: prevLoadQueue } = prevProps || { loadQueue: null };

  useEffect(() => {
    const isAuthenticated = authenticated;

    if (isAuthenticated && prevLoadQueue && syncStarted) {
      for (let index in loadQueue) {
        const queue = loadQueue[index];
        if ((prevLoadQueue && queue?.url === prevLoadQueue[index]?.url) || queue.isLoaded) {
          continue;
        }
        retrieveLibrary(authenticated, queue);
      }

      const isAllLoaded = prevLoadQueue && loadQueue.reduce((acc, queue) => queue.isLoaded && acc, true);
      if (isAllLoaded) {
        doPurgeDb();
        setSyncStarted(false);
      }
    }
  }, [authenticated, doPurgeDb, loadQueue, prevLoadQueue, retrieveLibrary, addToLoadQueue, markDb, syncStarted]);

  const handleClick = useCallback(() => {
    markDb();
    addToLoadQueue('https://api.spotify.com/v1/me/tracks?limit=50', true);
    setSyncStarted(true);
  }, [markDb, addToLoadQueue]);

  return (
    <button className={classNames('btn btn-light')} disabled={syncStarted} onClick={handleClick}>
      <i className="fas fa-sync" />
    </button>
  );
};

Overview.propTypes = {
  markDb: PropTypes.func.isRequired,
  addToLoadQueue: PropTypes.func.isRequired,
  doPurgeDb: PropTypes.func.isRequired,
  retrieveLibrary: PropTypes.func.isRequired,
  retrieveUserData: PropTypes.func.isRequired,
  loadQueue: PropTypes.array.isRequired,
  authenticated: PropTypes.string,
};

function mapStateToProps({ data }) {
  return {
    loadQueue: data.loadQueue ? data.loadQueue : [],
  };
}

export default connect(mapStateToProps, {
  addToLoadQueue,
  markDb,
  doPurgeDb,
  retrieveLibrary,
  retrieveUserData,
})(Overview);
