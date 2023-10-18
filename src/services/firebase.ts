import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGEING_SENDER_ID,
} from '@env'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp } from 'firebase/app'
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,

  authDomain: 'uconnectchat.firebaseapp.com',

  projectId: 'uconnectchat',

  storageBucket: 'uconnectchat.appspot.com',

  messagingSenderId: FIREBASE_MESSAGEING_SENDER_ID,

  appId: FIREBASE_APP_ID,

  measurementId: FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
})

const db = getFirestore(app)
const auth = getAuth(app)

export { auth, db, app }
