import { collection, type DocumentReference, getDocs, orderBy, query } from 'firebase/firestore'

import { type Message } from '../redux/models/userModel'

export const getMessages = async (docRef: DocumentReference): Promise<Message[]> => {
  const messagesCollection = collection(docRef, 'messages')
  const mQ = query(messagesCollection, orderBy('timestamp'))
  const messagesQuerySnapshot = await getDocs(mQ)
  const messages: Message[] = []

  messagesQuerySnapshot.forEach((doc) => {
    const messageData = doc.data()

    // Serialize the Firestore timestamp to ISO string
    const timestampISO = messageData.timestamp.toDate().toISOString()
    const serializedMessage = { ...messageData, timestamp: timestampISO }

    messages.push(serializedMessage as Message)
  })
  return messages
}

export const getInitials = (text?: string): string => {
  if (!text) return ''

  const initials = text
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return initials
}
