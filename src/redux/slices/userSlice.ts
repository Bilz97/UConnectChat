import { createSlice } from '@reduxjs/toolkit'

import {
  addFriend,
  enterChatRoom,
  getMyChatPreviews,
  getMyFriends,
  logoutUser,
  readyChatRoom,
  refetchChatRoom,
  updateProfilePhoto,
  updateUserInfo,
} from '../actions/userActions'
import { type ChatPreview, type ChatRoom, type User } from '../models/userModel'
import { type RootState } from '../store/store'

interface UserState {
  user: User | null
  myFriends: User[] | null
  activeChatRoom: ChatRoom | null
  myChatPreviews: ChatPreview[] | null
}

const initialState: UserState = {
  user: null,
  myFriends: null,
  activeChatRoom: null,
  myChatPreviews: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
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
    builder.addCase(getMyChatPreviews.fulfilled, (state, action) => {
      if (action.payload !== null) {
        state.myChatPreviews = action.payload
      }
    })
    builder.addCase(enterChatRoom.fulfilled, (state, action) => {
      if (action.payload !== null) {
        state.activeChatRoom = action.payload
      }
    })
    builder.addCase(updateUserInfo.fulfilled, (state, action) => {
      if (action.payload !== null) {
        state.user = action.payload
      }
    })
    builder.addCase(updateProfilePhoto.fulfilled, (state, action) => {
      if (action.payload !== null && state.user !== null) {
        state.user.photoUrl = action.payload
      }
    })
  },
})

export const { loginUser } = userSlice.actions

export const UserSelectors = {
  selectUser: (state: RootState) => state.user.user,
  selectMyFriends: (state: RootState) => state.user.myFriends,
  selectActiveChatRoom: (state: RootState) => state.user.activeChatRoom,
  selectMyChatPreviews: (state: RootState) => state.user.myChatPreviews,
}

export default userSlice.reducer
