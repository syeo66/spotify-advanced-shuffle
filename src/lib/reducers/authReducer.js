import { RETRIEVE_AUTH_TOKEN, FETCH_USER} from '../actions/types';

export default (state = false, action) => {
    switch (action.type) {
        case RETRIEVE_AUTH_TOKEN:
            return action.payload || null;
        default:
            return state;
    }
};