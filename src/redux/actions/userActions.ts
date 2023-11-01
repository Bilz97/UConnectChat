import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import Toast from 'react-native-toast-message'

import { auth, db, storage } from '../../services/firebase'
import { getLastMessage, getMessages } from '../../util/chatHelper'
import { type ChatPreview, type ChatRoom, type Message, type User } from '../models/userModel'

export const logoutUser = createAsyncThunk('user/logout', async () => {
  try {
    await auth.signOut()
    Toast.show({
      type: 'success',
      text1: 'Success!',
      text2: 'You have successfully logged out!',
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
    const docRef = doc(db, 'users', user.uid)
    const docSnapshot = await getDoc(docRef)

    if (!docSnapshot.exists()) {
      await setDoc(docRef, user)
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
        // Get the user data for each matching document
        const userData = doc.data() as User
        if (userData?.uid === userUid) {
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
      if (docSnapshot.exists() && docSnapshot.data()?.[friendUserId] != null) {
        Toast.show({
          type: 'info',
          text1: 'This user is already your friend',
        })
        return null
      }

      await setDoc(docRef, { [friendUserId]: { addedAt: serverTimestamp() } }, { merge: true })

      const usersCollection = collection(db, 'users')

      const q = query(usersCollection, where('uid', '==', friendUserId))
      const friends: User[] = []

      await getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
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
      const docRef = doc(db, 'friends', userUid)
      const docSnapshot = await getDoc(docRef)

      if (docSnapshot.exists()) {
        const friendsData = docSnapshot.data()

        // Extract the friend IDs from the document data and sort
        const friendUids = Object.keys(friendsData).sort(
          (a, b) =>
            (friendsData[a]?.addedAt?.toMillis() ?? 0) - (friendsData[b]?.addedAt?.toMillis() ?? 0)
        )

        const usersCollection = collection(db, 'users')

        // Query users collection for all matching uids
        const q = query(usersCollection, where('uid', 'in', friendUids))
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
    } catch {
      return []
    }
  }
)

export const readyChatRoom = createAsyncThunk(
  'user/readyChatRoom',
  async ({
    userUid,
    friendUserId,
  }: {
    userUid: string
    friendUserId: string
  }): Promise<ChatRoom | null> => {
    try {
      const chatRoomsCollection = collection(db, 'chatRooms')
      const participants = [userUid, friendUserId]

      // Firebase limitation, only 1 array-contains allowed per disjunction
      const q1 = query(chatRoomsCollection, where('participants', 'array-contains', userUid))
      const q2 = query(chatRoomsCollection, where('participants', 'array-contains', friendUserId))

      const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)])

      const matchingChatRooms = querySnapshot1.docs.filter((doc1) => {
        const chatRoomData1 = doc1.data()
        return querySnapshot2.docs.some((doc2) => chatRoomData1.roomName === doc2.data().roomName)
      })

      if (matchingChatRooms.length > 0) {
        // There should only be 1 matching chat room
        const chatRoomData = matchingChatRooms[0].data()
        const q = query(chatRoomsCollection, where('roomName', '==', chatRoomData.roomName))

        const docSnapshot = await getDocs(q)
        const chatRoomDoc = docSnapshot?.docs[0]

        const messages: Message[] = await getMessages(chatRoomDoc.ref)
        const chatRoom: ChatRoom = { roomName: chatRoomData.roomName, messages }

        return chatRoom
      }

      const roomName = `room-${userUid}-${friendUserId}`

      // Create a new chat room document with the custom document ID of roomName
      const docRef = doc(db, 'chatRooms', roomName)
      const chatRoomData = {
        roomName,
        participants,
      }

      // We use setDoc because we want to specify the document ID
      await setDoc(docRef, chatRoomData)

      const chatRoom: ChatRoom = { roomName: chatRoomData.roomName, messages: [] }
      return chatRoom
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'An error occured while creating the chatroom. Please try again.',
      })
      return null
    }
  }
)

export const enterChatRoom = createAsyncThunk(
  'user/enterChatRoom',
  async ({ roomName }: { roomName: string }): Promise<ChatRoom | null> => {
    try {
      const chatRoomsCollection = collection(db, 'chatRooms')

      // Firebase limitation, only 1 array-contains allowed per disjunction
      const q = query(chatRoomsCollection, where('roomName', '==', roomName))

      const docSnapshot = await getDocs(q)
      const chatRoomDoc = docSnapshot?.docs[0]

      const messages: Message[] = await getMessages(chatRoomDoc.ref)
      const chatRoom: ChatRoom = { roomName, messages }

      return chatRoom
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'An error occured while trying to access your chat room. Please try again later',
      })
      return null
    }
  }
)

export const sendMessage = createAsyncThunk(
  'user/sendMessage',
  async ({
    userUid,
    roomId,
    message,
  }: {
    userUid: string
    roomId: string
    message: string
  }): Promise<void> => {
    try {
      const docRef = doc(db, 'chatRooms', roomId)
      const messagesCollection = collection(docRef, 'messages')

      const newMessage = {
        text: message,
        sender: userUid,
        timestamp: serverTimestamp(),
      }

      await addDoc(messagesCollection, newMessage)
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Could not send message. Please try again later.',
      })
    }
  }
)

export const getUser = createAsyncThunk(
  'user/getUser',
  async ({ userUid }: { userUid: string }): Promise<User | null> => {
    try {
      const usersCollection = collection(db, 'users')

      const q = query(usersCollection, where('uid', '==', userUid))

      const docSnapshot = await getDocs(q)
      const userDoc = docSnapshot.docs[0]
      if (userDoc.exists()) {
        const user = userDoc.data() as User
        return user
      }
      return null
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Could not send message. Please try again later.',
      })
      return null
    }
  }
)

export const refetchChatRoom = createAsyncThunk(
  'user/refetchChatRoom',
  async ({ roomId }: { roomId: string }): Promise<ChatRoom> => {
    const chatRoomsCollection = collection(db, 'chatRooms')

    const q = query(chatRoomsCollection, where('roomName', '==', roomId))

    const docSnapshot = await getDocs(q)
    const chatRoomDoc = docSnapshot?.docs[0]

    const messages: Message[] = await getMessages(chatRoomDoc.ref)
    const chatRoom: ChatRoom = { roomName: roomId, messages }

    return chatRoom
  }
)

export const getMyChatPreviews = createAsyncThunk(
  'user/getMyChatPreviews',
  async ({ userUid }: { userUid: string }): Promise<ChatPreview[] | null> => {
    const chatRoomsCollection = collection(db, 'chatRooms')

    const q = query(chatRoomsCollection, where('participants', 'array-contains', userUid))

    const chatRoomsSnapshot = await getDocs(q)

    const chatPreviews = await Promise.all(
      chatRoomsSnapshot.docs.map(async (doc) => {
        const chatRoom = doc.data()
        const message = await getLastMessage(doc.ref)
        const chatPreview: ChatPreview = { roomName: chatRoom.roomName, lastMessage: message }
        return chatPreview
      })
    )

    // Filter empty messages and sort by most recent message sent
    return chatPreviews
      .filter((room) => room.lastMessage !== null)
      .sort((a, b) => {
        const aTimestamp = a.lastMessage?.timestamp
          ? new Date(a.lastMessage.timestamp).getTime()
          : 0
        const bTimestamp = b.lastMessage?.timestamp
          ? new Date(b.lastMessage.timestamp).getTime()
          : 0

        return bTimestamp - aTimestamp
      })
  }
)

export const updateProfilePhoto = createAsyncThunk(
  'user/updateProfilePhoto',
  async ({ userUid, photoUrl }: { userUid: string; photoUrl: string }): Promise<string | null> => {
    const usersCollection = collection(db, 'users')
    const q = query(usersCollection, where('uid', '==', userUid))
    const userSnapshots = await getDocs(q)
    const userDoc = userSnapshots.docs?.[0]

    if (userDoc?.exists()) {
      try {
        const response = await fetch(photoUrl)
        const blob = await response.blob()
        const fileSize = blob.size

        // Check if file size is less then 4MB
        if (fileSize > 4 * 1024 * 1024) {
          Toast.show({
            type: 'error',
            text1: 'Error!',
            text2: 'Image file is too large.',
          })

          return null
        }

        // Upload to Firebase Storage
        const imageRef = ref(storage, `userPhotos/${userUid}/profileImage.jpg`)
        await uploadBytes(imageRef, blob)

        // Get the download URL and update Firestore
        const downloadURL = await getDownloadURL(imageRef)
        await updateDoc(userDoc.ref, { photoUrl: downloadURL })

        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Your profile photo has been updated.',
        })

        return downloadURL
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Could not update profile photo.',
        })
        return null
      }
    }

    Toast.show({
      type: 'error',
      text1: 'Error!',
      text2: 'User not found.',
    })
    return null
  }
)

export const updateUserInfo = createAsyncThunk(
  'user/updateUserInfo',
  async ({
    userUid,
    displayName,
    aboutMe,
  }: {
    userUid: string
    displayName: string | null
    aboutMe: string | null
  }): Promise<User | null> => {
    const usersCollection = collection(db, 'users')
    const q = query(usersCollection, where('uid', '==', userUid))
    const userSnapshots = await getDocs(q)
    const userDoc = userSnapshots.docs?.[0]

    const payload = {
      ...(aboutMe !== null && { aboutMe }),
      ...(displayName !== null && { displayName }),
    }

    if (userDoc?.exists()) {
      try {
        await updateDoc(userDoc.ref, payload)
        const updatedDoc = await getDoc(userDoc.ref)

        const userData = updatedDoc.data() as User
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Your information has been updated',
        })
        return userData
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Could not update profile. Please try again later.',
        })
        return null
      }
    }

    Toast.show({
      type: 'error',
      text1: 'Error!',
      text2: 'User not found.',
    })
    return null
  }
)
