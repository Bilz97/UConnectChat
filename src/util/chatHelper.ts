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

export const getLastMessage = async (docRef: DocumentReference): Promise<Message | null> => {
  const messagesCollection = collection(docRef, 'messages')
  const mQ = query(messagesCollection, orderBy('timestamp', 'desc'))
  const messagesQuerySnapshot = await getDocs(mQ)

  if (messagesQuerySnapshot.empty) {
    return null
  }
  const latestMessageData = messagesQuerySnapshot.docs[0].data()

  // Serialize the Firestore timestamp to ISO string
  const timestampISO = latestMessageData.timestamp.toDate().toISOString()
  const serializedMessage: Message = {
    sender: latestMessageData.sender,
    displayName: latestMessageData.displayName,
    text: latestMessageData.text,
    timestamp: timestampISO,
  }

  return serializedMessage
}

export const getInitials = (text?: string): string => {
  if (text == null || text?.length === 0) return ''

  const initials = text
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return initials
}
