import * as React from 'react'
import { Text, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'

import LoginForm from '../forms/LoginForm'
import SignupForm from '../forms/SignupForm'
import { type RootStack } from '../navigation/navigation'

type LoginScreenNavigationProp = StackNavigationProp<RootStack, 'Auth'>

const AuthScreen = ({ navigation }: { navigation: LoginScreenNavigationProp }) => {
  const [isSignup, setIsSignup] = React.useState(false)
  return (
    <SafeAreaView className="flex-1 p-5">
      <Text className="text-gray-800 text-2xl font-bold self-center ">
        {'Welcome to UConnectChat!'}
      </Text>
      <View className={'flex-1 items-center justify-center'}>
        {isSignup ? (
          <SignupForm navigation={navigation} setIsSignup={setIsSignup} />
        ) : (
          <LoginForm navigation={navigation} setIsSignup={setIsSignup} />
        )}
      </View>
    </SafeAreaView>
  )
}

export default AuthScreen
