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

export interface ChatPreview {
  roomName: string
  lastMessage: Message | null
}

export interface ChatRoomPreview {
  friend: User
  lastMessage: Message | null
  roomName: string
}
