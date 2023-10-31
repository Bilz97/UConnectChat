import * as React from 'react'
import { ActivityIndicator, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { type StackNavigationProp } from '@react-navigation/stack'
import * as ImagePicker from 'expo-image-picker'
import { updateProfile } from 'firebase/auth'
import Toast from 'react-native-toast-message'

import NavBarOption from '../components/NavBarOption'
import { type SettingsStack } from '../navigation/navigation'
import { logoutUser, updateProfilePhoto } from '../redux/actions/userActions'
import { updateUserPhoto, UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'
import { auth } from '../services/firebase'

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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    })

    if (!result.canceled && result.assets?.[0].type === 'image') {
      const photoUrl = result.assets[0].uri

      const user = auth.currentUser
      if (user !== null) {
        try {
          const response = await dispatch(updateProfilePhoto({ userUid: profile.uid, photoUrl }))

          if (response.meta.requestStatus === 'fulfilled') {
            await updateProfile(user, {
              photoURL: photoUrl,
            })
            dispatch(updateUserPhoto(photoUrl))
          }
        } catch {
          Toast.show({
            type: 'error',
            text1: 'Error!',
            text2: 'Could not save profile photo. Please try again later.',
          })
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Could not save profile photo. Please try again later.',
        })
      }
    }
    setIsPhotoLoading(false)
  }, [dispatch, profile, auth])

  const profileAvatar = React.useCallback(() => {
    return (
      <View className="items-center mb-5 flex-start">
        <TouchableOpacity
          disabled={isPhotoLoading}
          onPress={pickImage}
          className="h-24 w-24 border items-center justify-center rounded-full"
        >
          {isPhotoLoading ? (
            <ActivityIndicator size={'small'} />
          ) : profile?.photoUrl !== null ? (
            <Image
              source={{ uri: profile.photoUrl }}
              className="w-full h-full rounded-full"
              resizeMode="stretch"
            />
          ) : (
            <Feather name="user-plus" size={50} />
          )}
        </TouchableOpacity>
        <Text className="px-2 font-bold text-lg">{profile.displayName}</Text>
      </View>
    )
  }, [profile?.photoUrl, isPhotoLoading])

  return (
    <SafeAreaView className="flex-1 m-5">
      <View className={'flex-1'}>
        {profileAvatar()}
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
