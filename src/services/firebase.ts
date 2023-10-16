import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGEING_SENDER_ID,
} from '@env'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,

  authDomain: 'uconnectchat.firebaseapp.com',

  projectId: 'uconnectchat',

  storageBucket: 'uconnectchat.appspot.com',

  messagingSenderId: FIREBASE_MESSAGEING_SENDER_ID,

  appId: FIREBASE_APP_ID,

  measurementId: FIREBASE_MEASUREMENT_ID,
}

export const app = initializeApp(firebaseConfig)
