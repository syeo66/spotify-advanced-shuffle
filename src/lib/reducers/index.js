import { combineReducers } from 'redux';

import auth from './authReducer';
import data from './dataReducer';

export default combineReducers({
  data,
  auth,
});
