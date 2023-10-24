export interface User {
  email: string
  uid: string
  displayName?: string
  photoUrl?: string
}

export interface Message {
  sender: string
  text: string
  timestamp: string
}

export interface ChatRoom {
  id: string
  messages: Message[]
}

export interface MyChatRooms {
  chatRooms: ChatRoom[]
}
