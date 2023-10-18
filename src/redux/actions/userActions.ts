import { createAsyncThunk } from '@reduxjs/toolkit'
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
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

export const storeUserData = createAsyncThunk(
  'user/storeUserData',
  async ({ user }: { user: User }) => {
    const usersCollection = collection(db, 'users')

    const docRef = doc(db, `users/${user.uid}`)
    const docSnapshot = await getDoc(docRef)

    if (!docSnapshot.exists()) {
      await addDoc(usersCollection, user)
    }
  }
)

export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async ({ userUid, displayName }: { userUid: string; displayName: string }): Promise<User[]> => {
    const usersCollection = collection(db, 'users')

    const q = query(usersCollection, where('displayName', '>=', displayName))

    const querySnapshot = await getDocs(q)
    const users: User[] = []

    querySnapshot.forEach((doc) => {
      if (doc.exists()) {
        const userData = doc.data() as User
        if (userData?.displayName == null || userData?.uid === userUid) {
          return
        }
        if (userData?.displayName.includes(displayName)) {
          users.push(userData)
        }
      }
    })

    return users
  }
)

export const addFriend = createAsyncThunk(
  'user/addFriend',
  async ({
    userUid,
    friendUserId,
  }: {
    userUid: string
    friendUserId: string
  }): Promise<User | null> => {
    try {
      const docRef = doc(db, 'friends', userUid)

      const docSnapshot = await getDoc(docRef)

      // Check if the friend is already added
      if (docSnapshot.exists() && docSnapshot.data()?.[friendUserId]) {
        // Friend already exists, return an appropriate result
        Toast.show({
          type: 'info',
          text1: 'This user is already your friend',
        })
        return null
      }

      await setDoc(docRef, { [friendUserId]: true }, { merge: true })

      const usersCollection = collection(db, 'users')

      const q = query(usersCollection, where('uid', '==', friendUserId))
      const friends: User[] = []
      await getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // Get the user data for each matching document
          const userData = doc.data() as User
          friends.push(userData)
        })
      })
      return friends[0]
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'An error occured when adding your friend. Please try again.',
      })
      return null
    }
  }
)

export const getMyFriends = createAsyncThunk(
  'user/myFriends',
  async ({ userUid }: { userUid: string }): Promise<User[]> => {
    try {
      const docRef = doc(db, `friends/${userUid}`)
      const docSnapshot = await getDoc(docRef)

      if (docSnapshot.exists()) {
        const friendData = docSnapshot.data()

        // Extract the friend IDs from the document data
        const friendIds = Object.keys(friendData)

        const usersCollection = collection(db, 'users')
        // Query users collection for all matching uids
        const q = query(usersCollection, where('uid', 'in', friendIds))
        const friends: User[] = []

        await getDocs(q).then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            // Get the user data for each matching document
            const userData = doc.data() as User
            friends.push(userData)
          })
        })

        return friends
      } else {
        // If the document doesn't exist, the user has no friends
        return []
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Could not find friends.',
      })
      return []
    }
  }
)
