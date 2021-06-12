import {
  ADD_TO_LOAD_QUEUE,
  FETCH_USER,
  LOAD_LIBRARY_PAGE,
  FETCH_LIBRARY,
  FIRST_PAGE,
  PREVIOUS_PAGE,
  NEXT_PAGE,
  FETCH_PLAYLISTS,
  APPEND_PLAYLISTS,
  FETCH_PLAYER,
  FETCH_PLAY_STATE,
  TOGGLE_CONFIG,
  UPDATE_CONFIG,
  DB_COUNT,
  TOGGLE_PLAYLIST,
  CHECKED_PLAYLISTS,
  PURGE_LOAD_QUEUE,
} from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case FIRST_PAGE:
      return {
        ...state,
        currentPage: 1,
      };

    case NEXT_PAGE: {
      const librarySize = state.loadQueue.reduce((acc, queue) => acc + queue.size, 0);
      const currentPage = Math.min(Math.ceil(librarySize / state.itemsPerPage), state.currentPage + 1);
      return {
        ...state,
        currentPage: currentPage,
      };
    }

    case PREVIOUS_PAGE:
      return { ...state, currentPage: Math.max(1, state.currentPage - 1) };

    case APPEND_PLAYLISTS: {
      const playlists = [
        ...(state.playlists?.filter((i) => !action.payload.items?.find((p) => i.id === p.id)) || []),
        ...action.payload.items,
      ];
      return {
        ...state,
        playlists: playlists,
        playlistsSize: action.payload.total,
      };
    }

    case FETCH_PLAYLISTS:
      return {
        ...state,
        playlists: action.payload.items,
        playlistsSize: action.payload.total,
      };

    case CHECKED_PLAYLISTS:
      return { ...state, checkedPlaylists: action.payload };

    case TOGGLE_PLAYLIST: {
      const { id, userId } = action.payload;
      if (!state.checkedPlaylists) {
        window.localStorage.setItem(userId + '.checkedPlaylists', JSON.stringify([id]));
        return { ...state, checkedPlaylists: [id] };
      }
      const checked =
        state.checkedPlaylists.indexOf(id) !== -1
          ? state.checkedPlaylists.filter((value) => {
              return value !== id;
            })
          : [...state.checkedPlaylists, id];

      window.localStorage.setItem(userId + '.checkedPlaylists', JSON.stringify(checked));

      return {
        ...state,
        checkedPlaylists: checked,
      };
    }

    case PURGE_LOAD_QUEUE:
      return {
        ...state,
        loadQueue: [],
        library: [],
      };

    case ADD_TO_LOAD_QUEUE:
      return {
        ...state,
        loadQueue: action.purge
          ? [
              {
                origUrl: action.payload,
                url: action.payload,
                isLoaded: false,
                current: 0,
                size: 0,
                next: 0,
              },
            ]
          : [
              ...state.loadQueue,
              {
                origUrl: action.payload,
                url: action.payload,
                isLoaded: false,
                current: 0,
                size: 0,
                next: 0,
              },
            ],
      };

    case LOAD_LIBRARY_PAGE:
      return {
        ...state,
        library: action.payload,
      };

    case FETCH_LIBRARY: {
      const loadQueue = state.loadQueue.map((entry) => {
        if (entry.origUrl === action.payload.origUrl) {
          return {
            ...action.payload,
            url: action.payload.next,
            isLoaded: !action.payload.next,
          };
        }
        return entry;
      });
      return {
        ...state,
        loadQueue,
      };
    }

    case DB_COUNT:
      return {
        ...state,
        dbSize: action.payload.dbSize || 0,
      };

    case FETCH_USER:
      return { ...state, user: action.user };

    case FETCH_PLAYER:
      return { ...state, devices: action.devices.devices };

    case FETCH_PLAY_STATE:
      return { ...state, playstate: action.playstate };

    case TOGGLE_CONFIG:
      return { ...state, showConfig: !state.showConfig };

    case UPDATE_CONFIG:
      return { ...state, config: { ...state.config, ...action.config } };

    default:
      return state;
  }
};
