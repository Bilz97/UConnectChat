import * as React from 'react'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createStackNavigator } from '@react-navigation/stack'
import { onAuthStateChanged } from 'firebase/auth'
import Toast from 'react-native-toast-message'

import AudioVideoScreenModal from './src/modals/AudioVideoScreen'
import ChatScreenModal from './src/modals/ChatScreen'
import FriendInfoScreenModal from './src/modals/FriendInfoScreen'
import {
  type AppTabStack,
  type ModalStack,
  type RootStack,
  type SettingsStack,
} from './src/navigation/navigation'
import { getUser } from './src/redux/actions/userActions'
import { type User } from './src/redux/models/userModel'
import { loginUser, UserSelectors } from './src/redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from './src/redux/store/hooks'
import AuthScreen from './src/screens/AuthScreen'
import HomeScreen from './src/screens/HomeScreen'
import PersonalInfoScreen from './src/screens/PersonalInfoScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import { auth } from './src/services/firebase'

export default function App() {
  const Stack = createNativeStackNavigator<RootStack>()
  const Tab = createBottomTabNavigator<AppTabStack>()
  const Modal = createNativeStackNavigator<ModalStack>()
  const Settings = createStackNavigator<SettingsStack>()

  const profile = useAppSelector(UserSelectors.selectUser)

  const dispatch = useAppDispatch()

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth !== null) {
        // User is logged in, send the user's details to redux, store the current user in the state
        const response = await dispatch(getUser({ userUid: userAuth.uid }))
        const user = response.payload as User
        dispatch(loginUser(user))
      }
    })

    return unsubscribe
  }, [dispatch])

  const SettingsStack = () => {
    return (
      <Settings.Navigator screenOptions={{ headerShown: true }}>
        <Settings.Screen name="Settings" component={SettingsScreen} />
        <Settings.Screen
          name="PersonalInformation"
          component={PersonalInfoScreen}
          options={{ title: 'Personal Information' }}
        />
      </Settings.Navigator>
    )
  }
  const AppTabStack = () => {
    return (
      <Tab.Navigator initialRouteName="Home">
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="SettingsStack"
          component={SettingsStack}
          options={{ headerShown: false, title: 'Settings' }}
        />
      </Tab.Navigator>
    )
  }

  const ModalStack = () => {
    return (
      <Modal.Navigator screenOptions={{ headerShown: true }}>
        <Modal.Screen name="ChatRoomModal" component={ChatScreenModal} />
        <Modal.Screen name="FriendInfoModal" component={FriendInfoScreenModal} />
        <Modal.Screen name="AudioVideoModal" component={AudioVideoScreenModal} />
      </Modal.Navigator>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={profile == null ? 'Auth' : 'AppStack'}>
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AppStack" component={AppTabStack} options={{ headerShown: false }} />
        <Stack.Screen
          name="ModalStack"
          component={ModalStack}
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack.Navigator>
      <Toast position="bottom" />
    </NavigationContainer>
  )
}
