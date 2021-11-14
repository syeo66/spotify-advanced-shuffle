import { RETRIEVE_AUTH_TOKEN } from '../actions/types';

const authReducer = (state = false, action) => {
  switch (action.type) {
    case RETRIEVE_AUTH_TOKEN:
      return action.payload || false;
    default:
      return state;
  }
};

export default authReducer;
