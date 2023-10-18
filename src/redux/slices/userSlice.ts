import { createSlice } from '@reduxjs/toolkit'

import { addFriend, getMyFriends, logoutUser } from '../actions/userActions'
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
    myFriends: [] as User[],
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
    builder.addCase(getMyFriends.fulfilled, (state, action) => {
      if (action.payload) {
        state.myFriends = action.payload
      }
    })
    builder.addCase(addFriend.fulfilled, (state, action) => {
      console.log('*** add Friend: ', action.payload)
      if (action.payload) {
        const friends = state.myFriends
        friends.push(action.payload)
        state.myFriends = friends
      }
    })
  },
})

export const { loginUser } = userSlice.actions

export const UserSelectors = {
  selectUser: (state: RootState) => state.user.user,
  selectMyFriends: (state: RootState) => state.user.myFriends,
}

export default userSlice.reducer
