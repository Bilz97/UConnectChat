import * as React from 'react'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createStackNavigator } from '@react-navigation/stack'
import { onAuthStateChanged } from 'firebase/auth'
import Toast from 'react-native-toast-message'

import ChatScreenModal from './src/modals/ChatScreen'
import {
  type AppTabStack,
  type ModalStack,
  type RootStack,
  type SettingsStack,
} from './src/navigation/navigation'
import { loginUser, UserSelectors } from './src/redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from './src/redux/store/hooks'
import AuthScreen from './src/screens/AuthScreen'
import HomeScreen from './src/screens/HomeScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import { auth } from './src/services/firebase'

export default function App() {
  const Stack = createNativeStackNavigator<RootStack>()
  const Tab = createBottomTabNavigator<AppTabStack>()
  const Modal = createNativeStackNavigator<ModalStack>()
  const Settings = createStackNavigator<SettingsStack>()

  const user = useAppSelector(UserSelectors.selectUser)

  const dispatch = useAppDispatch()

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
      if (userAuth !== null) {
        // User is logged in, send the user's details to redux, store the current user in the state
        dispatch(
          loginUser({
            email: userAuth.email,
            uid: userAuth.uid,
            displayName: userAuth.displayName,
            photoUrl: userAuth?.photoURL ?? null,
          })
        )
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
          component={SettingsScreen}
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
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    )
  }

  const ModalStack = () => {
    return (
      <Modal.Navigator screenOptions={{ headerShown: true }}>
        <Modal.Screen name="ChatRoomModal" component={ChatScreenModal} />
      </Modal.Navigator>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user === null ? 'Auth' : 'AppStack'}>
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
