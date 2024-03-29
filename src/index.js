import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';

import App from './lib/app';
import reducers from './lib/reducers';

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

const store = createStore(reducers, initialState, applyMiddleware(thunk));

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Provider>
);
