import * as React from 'react'
import { SafeAreaView, Text, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'

import SearchBar from '../components/SearchBar'
import { type AppTabStack } from '../navigation/navigation'

type HomeScreenNavigationProp = StackNavigationProp<AppTabStack, 'Home'>

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
  const myFriends = () => {
    return (
      // flat list horizontal with list of friends
      <View className="mt-5">
        <Text className="text-lg font-bold">{'My friends'}</Text>
      </View>
    )
  }

  const myMessages = () => {
    return (
      // flat list horizontal with list of friends
      <View className="mt-5">
        <Text className="text-lg font-bold">{'My Messages'}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 m-5">
      <View className={'flex-1'}>
        <SearchBar />
        {myFriends()}
        {myMessages()}
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen
