export interface User {
  email: string
  uid: string
  displayName: string
  photoUrl?: string
}

export interface Message {
  sender: string
  displayName: string
  text: string
  timestamp: string
}

export interface ChatRoom {
  roomName: string
  messages: Message[]
}
