import * as React from 'react'
import { SafeAreaView, Text, TextInput, View } from 'react-native'

import { EvilIcons } from '@expo/vector-icons'
import { type StackNavigationProp } from '@react-navigation/stack'
import { useFormik } from 'formik'

import { type AppTabStack } from '../navigation/navigation'

type HomeScreenNavigationProp = StackNavigationProp<AppTabStack, 'Home'>

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
  const { values, handleChange } = useFormik({
    initialValues: {
      search: '',
    },
    onSubmit: (value) => {
      console.log('*** search: ', value)
    },
  })

  const searchBar = () => {
    return (
      <View className="flex-row items-center border rounded-sm border-gray-700 bg-white">
        <TextInput
          maxLength={20}
          className="px-2 bg-gray-50 h-12 flex-1 bg-transparent"
          placeholder={'search for friends'}
          onChangeText={handleChange('search')}
          value={values.search}
        />
        <View className="p-2">
          <EvilIcons name="search" size={28} color="gray" />
        </View>
      </View>
    )
  }

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
        {searchBar()}
        {myFriends()}
        {myMessages()}
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen
