import { type NavigatorScreenParams } from '@react-navigation/native'

import { type ChatRoom } from '../redux/models/userModel'
// CompositeScreenProps?

export type RootStack = {
  Auth: undefined
  App: NavigatorScreenParams<AppTabStack>
  Modals: NavigatorScreenParams<ModalStack>
}

export type AppTabStack = {
  Home: undefined
  Settings: undefined
}

export type ModalStack = {
  ChatRoomModal: {
    name?: string
    friendId?: string
    chatRoom?: ChatRoom
  }
}
