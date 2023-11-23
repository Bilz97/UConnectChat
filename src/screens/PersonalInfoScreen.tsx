import * as React from 'react'
import { SafeAreaView, View } from 'react-native'

import PersonalInfoForm from '../forms/PersonalInfoForm'

const PersonalInfoScreen = () => {
  return (
    <SafeAreaView className="flex-1 m-5">
      <View className={'flex-1'}>
        <PersonalInfoForm />
      </View>
    </SafeAreaView>
  )
}

export default PersonalInfoScreen
