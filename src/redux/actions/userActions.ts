import { createAsyncThunk } from '@reduxjs/toolkit'
import { getAuth } from 'firebase/auth'
import Toast from 'react-native-toast-message'

// Create an async thunk to handle user logout
export const logoutUser = createAsyncThunk('user/logout', async () => {
  try {
    console.log('*** try logout')
    await getAuth().signOut()
    Toast.show({
      type: 'success',
      text1: 'You have successfully logged out!',
    })
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Error!',
      text2: 'Error signing out. Please try again.',
    })
  }
})
