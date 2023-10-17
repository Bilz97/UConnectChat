import { combineReducers } from 'redux'

// Import your individual reducers
import userReducer from '../slices/userSlice'

// ... import other reducers as needed

// Combine the individual reducers into the rootReducer
const rootReducer = combineReducers({
  user: userReducer,
  // ... add other reducer slices as needed
})

export default rootReducer
