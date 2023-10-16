import * as React from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

import { EvilIcons } from '@expo/vector-icons'

const SettingsScreen = () => {
  const settingsOption = (title: string, onPress: () => void) => {
    return (
      <TouchableOpacity className="flex-row justify-between border w-full mb-5 p-5 border-gray-300 rounded-md">
        <Text className="text-lg ">{title}</Text>

        <EvilIcons name="chevron-right" size={36} color="gray" />
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView className="flex-1 m-5">
      <View className={'flex-1 items-center'}>
        {settingsOption('Personal information', null)}
        {settingsOption('Logout', null)}
      </View>
    </SafeAreaView>
  )
}

export default SettingsScreen
