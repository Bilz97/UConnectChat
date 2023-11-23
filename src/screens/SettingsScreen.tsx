import * as React from 'react'
import { SafeAreaView, Text, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'

import NavBarOption from '../components/NavBarOption'
import ProfileAvatar from '../components/ProfileAvatar'
import { type SettingsStack } from '../navigation/navigation'
import { logoutUser } from '../redux/actions/userActions'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStack, 'Settings'>

interface Props {
  navigation: SettingsScreenNavigationProp
}

const SettingsScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch()

  const profile = useAppSelector(UserSelectors.selectUser)

  if (profile == null) {
    return
  }

  const logout = React.useCallback(async () => {
    await dispatch(logoutUser()).then(() => navigation.getParent()?.navigate('Auth'))
  }, [navigation, dispatch])

  const pressableProfileAvatar = React.useCallback(() => {
    return (
      <View className="items-center mb-5 flex-start">
        <ProfileAvatar
          photoUrl={profile?.photoUrl ?? null}
          displayName={profile.displayName}
          customClassName="w-24 h-24"
          largeText
          pressable
        />
        <Text className="px-2 font-bold text-lg">{profile.displayName}</Text>
      </View>
    )
  }, [profile?.photoUrl])

  return (
    <SafeAreaView className="flex-1 m-5">
      <View className={'flex-1'}>
        {pressableProfileAvatar()}
        <NavBarOption
          title="Personal information"
          onPress={() => {
            navigation.push('PersonalInformation')
          }}
        />
        <NavBarOption title="Logout" onPress={logout} />
      </View>
    </SafeAreaView>
  )
}

export default SettingsScreen
