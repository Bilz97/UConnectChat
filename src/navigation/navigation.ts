import { type NavigatorScreenParams } from '@react-navigation/native'

// CompositeScreenProps?

export type RootStack = {
  Auth: undefined
  AppStack: NavigatorScreenParams<AppTabStack>
  ModalStack: NavigatorScreenParams<ModalStack>
}

export type AppTabStack = {
  Home: undefined
  SettingsStack: NavigatorScreenParams<SettingsStack>
}

export type ModalStack = {
  ChatRoomModal: {
    name?: string
    friendUid?: string
  }
  FriendInfoModal: {
    friendUid?: string
  }
}

export type SettingsStack = {
  Settings: undefined
  PersonalInformation: undefined
}
