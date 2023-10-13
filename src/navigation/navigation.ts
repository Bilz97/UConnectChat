import { type NavigatorScreenParams } from '@react-navigation/native'
// CompositeScreenProps?

export type RootStack = {
  Auth: undefined
  App: NavigatorScreenParams<AppTabStack>
}

export type AppTabStack = {
  Home: undefined
  Settings: undefined
}
