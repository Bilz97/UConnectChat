import { createSlice } from '@reduxjs/toolkit'

import { logoutUser } from '../actions/userActions'
import { type RootState } from '../store/store'

export interface User {
  email: string
  uid: string
  displayName?: string
  photoUrl?: string
}

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {} as User,
  },
  reducers: {
    loginUser: (state, action) => {
      // Save user state when login is successful
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
      // Reset the user state when logout is successful
      state.user = {} as User
    })
  },
})

export const { loginUser } = userSlice.actions

export const UserSelectors = {
  selectUser: (state: RootState) => state.user.user,
}

export default userSlice.reducer
