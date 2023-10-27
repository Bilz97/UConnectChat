import { createSlice } from '@reduxjs/toolkit'

import {
  addFriend,
  getMyChatRooms,
  getMyFriends,
  logoutUser,
  readyChatRoom,
  refetchChatRoom,
} from '../actions/userActions'
import { type ChatRoom, type User } from '../models/userModel'
import { type RootState } from '../store/store'

interface UserState {
  user: User | null
  myFriends: User[] | null
  activeChatRoom: ChatRoom | null
  myChatRooms: ChatRoom[] | null
}

const initialState: UserState = {
  user: null,
  myFriends: null,
  activeChatRoom: null,
  myChatRooms: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      // Save user state when login is successful
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
      // Reset the user state when logout is successful
      state.user = null
    })
    builder.addCase(getMyFriends.fulfilled, (state, action) => {
      if (action.payload !== null) {
        state.myFriends = action.payload
      }
    })
    builder.addCase(addFriend.fulfilled, (state, action) => {
      if (action.payload !== null) {
        const friends = state.myFriends ?? []
        friends.unshift(action.payload)
        state.myFriends = friends
      }
    })
    builder.addCase(readyChatRoom.fulfilled, (state, action) => {
      if (action.payload !== null) {
        state.activeChatRoom = action.payload
      }
    })
    builder.addCase(refetchChatRoom.fulfilled, (state, action) => {
      if (action.payload !== null) {
        state.activeChatRoom = action.payload
      }
    })
    builder.addCase(getMyChatRooms.fulfilled, (state, action) => {
      if (action.payload !== null) {
        state.myChatRooms = action.payload
      }
    })
  },
})

export const { loginUser } = userSlice.actions

export const UserSelectors = {
  selectUser: (state: RootState) => state.user.user,
  selectMyFriends: (state: RootState) => state.user.myFriends,
  selectActiveChatRoom: (state: RootState) => state.user.activeChatRoom,
  selectMyChatRooms: (state: RootState) => state.user.myChatRooms,
}

export default userSlice.reducer
