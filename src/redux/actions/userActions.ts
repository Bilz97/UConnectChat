import { createAsyncThunk } from '@reduxjs/toolkit'
import { addDoc, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import Toast from 'react-native-toast-message'

import { auth, db } from '../../services/firebase'
import { type User } from '../slices/userSlice'

export const logoutUser = createAsyncThunk('user/logout', async () => {
  try {
    console.log('*** try logout')
    await auth.signOut()
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

export const storeUserData = createAsyncThunk('user/storeUserData', async (user: User) => {
  const usersCollection = collection(db, 'users')

  const docRef = doc(db, `users/${user.uid}`)
  const docSnapshot = await getDoc(docRef)

  if (!docSnapshot.exists()) {
    await addDoc(usersCollection, user)
  }
})

export const searchUsers = createAsyncThunk('user/searchUsers', async (displayName: string) => {
  const usersCollection = collection(db, 'users')

  const q = query(usersCollection, where('displayName', '>=', displayName))

  const querySnapshot = await getDocs(q)
  const users: User[] = []

  querySnapshot.forEach((doc) => {
    if (doc.exists()) {
      const userData = doc.data() as User
      if (userData?.displayName == null) {
        return
      }
      if (userData?.displayName.includes(displayName)) {
        users.push(userData)
      }
    }
  })

  return users
})
