import * as React from 'react'
import { Button, Text, TextInput, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'

import { type AppTabStack } from '../navigation/navigation'
type HomeScreenNavigationProp = StackNavigationProp<AppTabStack, 'Home'>

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <View className={'flex-1 items-center'}>
        <Text>{'This is the future home screen'}</Text>
        <View className={'justify-center h-80 w-80'}>
          <Text>{'Enter username'}</Text>
          <TextInput></TextInput>
          <Button
            title="go to next screen"
            onPress={() => {
              navigation.navigate('Settings')
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen
