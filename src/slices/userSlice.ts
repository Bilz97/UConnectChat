import { createSelector, createSlice } from '@reduxjs/toolkit'
import { getAuth } from 'firebase/auth'

import { type RootState } from '../store/store'

interface User {
  email: string
  uid: string
  displayName?: string
  photoUrl?: string
}
// const user: User = {
//   email: '',
//   uid: '',
//   displayName: undefined,
//   photoUrl: undefined,
// }

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {} as User,
  },
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload
    },
    logoutUser: (state) => {
      state.user = {} as User
      // getAuth().signOut()
    },
  },
})

export const { loginUser, logoutUser } = userSlice.actions

// for larger applications best practice would be to have a seperate selectors file
export const user = (state: RootState) => state.user.user

export const UserSelectors = {
  getUser: createSelector(user, (userData) => userData as User | null),

  // Add more user-related selectors here
}

export default userSlice.reducer
