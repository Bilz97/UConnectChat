import { createSlice } from '@reduxjs/toolkit'

import { logoutUser } from '../actions/userActions'
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
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
      // Reset the user state when logout is successful
      console.log('*** reset user')
      state.user = {} as User
    })
  },
})

export const { loginUser } = userSlice.actions

// for larger applications best practice would be to have a seperate selectors file

export const UserSelectors = {
  selectUser: (state: RootState) => state.user.user,

  // Add more user-related selectors here
}

export default userSlice.reducer
