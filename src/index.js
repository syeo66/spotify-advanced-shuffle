import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import reducers from './lib/reducers';
import App from './lib/app';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

import 'bootstrap';

const queryClient = new QueryClient();

const initialState = {
  auth: false,
  data: {
    dbSize: 0,
    currentPage: 0,
    itemsPerPage: 20,
    showConfig: false,
    checkedPlaylists: [],
    loadQueue: [],
    library: false,
    config: {
      trackCount: 200, // the track count if type 'count'
      trackMinutes: 60 * 12, // the minutes if type 'minutes'
      amountType: 'count', //  'count' / 'minutes'
      randomListName: 'Advanced Shuffle', // the playlists name to create shuffle
      purgeOnShuffle: true, // purge an existing list before shuffle
      useCollections: false, // use collections for shuffle?
    },
  },
};

const store = createStore(reducers, initialState, applyMiddleware(reduxThunk));

ReactDOM.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Provider>,
  document.getElementById('root')
);
