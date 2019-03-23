import { RETRIEVE_AUTH_TOKEN } from '../actions/types';

export default (state = false, action) => {
    switch (action.type) {
        case RETRIEVE_AUTH_TOKEN:
            return action.payload || false;
        default:
            return state;
    }
};
