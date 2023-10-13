import { type NavigatorScreenParams } from '@react-navigation/native'
// CompositeScreenProps?

export type RootStack = {
  Auth: NavigatorScreenParams<AuthStack>
  App: NavigatorScreenParams<AppTabStack>
}

export type AppTabStack = {
  Home: undefined
  Settings: undefined
}

export type AuthStack = {
  Login: undefined
}
