import * as React from 'react'
import { ActivityIndicator, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { type StackNavigationProp } from '@react-navigation/stack'

import NavBarOption from '../components/NavBarOption'
import ProfileAvatar from '../components/ProfileAvatar'
import { type SettingsStack } from '../navigation/navigation'
import { logoutUser } from '../redux/actions/userActions'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'
import { imagePicker } from '../util/userHelper'

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStack, 'Settings'>

interface Props {
  navigation: SettingsScreenNavigationProp
}

const SettingsScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch()

  const [isPhotoLoading, setIsPhotoLoading] = React.useState(false)
  const profile = useAppSelector(UserSelectors.selectUser)

  if (profile == null) {
    return
  }

  const logout = React.useCallback(async () => {
    await dispatch(logoutUser()).then(() => navigation.getParent()?.navigate('Auth'))
  }, [navigation, dispatch])

  const pickImage = React.useCallback(async () => {
    setIsPhotoLoading(true)
    await imagePicker(profile.uid)
    setIsPhotoLoading(false)
  }, [profile])

  const pressableProfileAvatar = React.useCallback(() => {
    return (
      <View className="items-center mb-5 flex-start">
        <ProfileAvatar
          photoUrl={profile?.photoUrl ?? null}
          displayName={profile.displayName}
          size={24}
          pressable
        />
        <Text className="px-2 font-bold text-lg">{profile.displayName}</Text>
      </View>
    )
  }, [profile?.photoUrl, isPhotoLoading])

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
