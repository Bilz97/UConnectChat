import * as React from 'react'
import { TouchableOpacity } from 'react-native'

import { EvilIcons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { onAuthStateChanged } from 'firebase/auth'
import Toast from 'react-native-toast-message'

import { type AppTabStack, type ModalStack, type RootStack } from './src/navigation/navigation'
import { loginUser, UserSelectors } from './src/redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from './src/redux/store/hooks'
import AuthScreen from './src/screens/AuthScreen'
import ChatScreenModal from './src/screens/ChatScreen'
import HomeScreen from './src/screens/HomeScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import { auth } from './src/services/firebase'

export default function App() {
  const Stack = createNativeStackNavigator<RootStack>()
  const Tab = createBottomTabNavigator<AppTabStack>()
  const Modal = createNativeStackNavigator<ModalStack>()
  const user = useAppSelector(UserSelectors.selectUser)

  const dispatch = useAppDispatch()

  // check at page load if a user is authenticated
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
      if (userAuth) {
        // user is logged in, send the user's details to redux, store the current user in the state
        dispatch(
          loginUser({
            email: userAuth.email,
            uid: userAuth.uid,
            displayName: userAuth?.displayName ?? null,
            photoUrl: userAuth?.photoURL ?? null,
          })
        )
      }
    })

    return unsubscribe
  }, [dispatch])

  const AppTabStack = () => {
    return (
      <Tab.Navigator initialRouteName="Home">
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    )
  }

  const ModalStack = () => {
    return (
      <Modal.Navigator screenOptions={{ headerShown: true, presentation: 'modal' }}>
        <Modal.Screen name="ChatRoomModal" component={ChatScreenModal} />
      </Modal.Navigator>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user?.email ? 'App' : 'Auth'}>
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="App" component={AppTabStack} options={{ headerShown: false }} />
        <Stack.Screen name="Modals" component={ModalStack} options={{ headerShown: false }} />
      </Stack.Navigator>
      <Toast position="bottom" />
    </NavigationContainer>
  )
}
