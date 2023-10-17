import { combineReducers } from 'redux'

import userReducer from '../slices/userSlice'

// Combine the individual reducers into the rootReducer
const rootReducer = combineReducers({
  user: userReducer,
})

export default rootReducer
