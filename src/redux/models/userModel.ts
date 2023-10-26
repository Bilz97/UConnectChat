export type User = {
  email: string
  uid: string
  displayName: string
  photoUrl?: string
}

export type Message = {
  sender: string
  displayName: string
  text: string
  timestamp: string
}

export type ChatRoom = {
  id: string
  messages: Message[]
}
