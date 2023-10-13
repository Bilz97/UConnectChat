import * as React from 'react'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { type AppTabStack, type AuthStack, type RootStack } from './src/navigation/navigation'
import LoginScreen from './src/screens/AuthScreen'
import HomeScreen from './src/screens/HomeScreen'
import SettingsScreen from './src/screens/SettingsScreen'

export default function App() {
  const Stack = createNativeStackNavigator<RootStack>()
  const Tab = createBottomTabNavigator<AppTabStack>()

  const AppTabStack = () => {
    return (
      <Tab.Navigator initialRouteName="Home">
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    )
  }

  const AuthStack = () => {
    const AuthStack = createNativeStackNavigator<AuthStack>()
    return (
      <AuthStack.Navigator>
        <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </AuthStack.Navigator>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
        <Stack.Screen name="App" component={AppTabStack} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}