import * as React from 'react'
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { UserSelectors } from '../redux/slices/userSlice'
import { useAppSelector } from '../redux/store/hooks'
import { getInitials } from '../util/chatHelper'
import { imagePicker } from '../util/userHelper'

interface Props {
  photoUrl: string | null
  displayName: string
  largeText?: boolean
  customClassName?: string
  pressable?: boolean
}
const ProfileAvatar = ({
  photoUrl,
  displayName,
  largeText = false,
  customClassName = '',
  pressable = false,
}: Props) => {
  const [isPhotoLoading, setIsPhotoLoading] = React.useState(false)
  const profile = useAppSelector(UserSelectors.selectUser)

  const pickImage = React.useCallback(async () => {
    if (profile !== null) {
      setIsPhotoLoading(true)
      await imagePicker(profile.uid)
      setIsPhotoLoading(false)
    }
  }, [profile])

  if (pressable) {
    return (
      <TouchableOpacity
        disabled={isPhotoLoading}
        onPress={pickImage}
        className="h-24 w-24 border items-center justify-center rounded-full"
      >
        {isPhotoLoading || profile == null ? (
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
    )
  }

  return (
    <View className={`rounded-full justify-center items-center border ${customClassName}`}>
      {photoUrl !== null ? (
        <Image
          source={{ uri: photoUrl }}
          className="w-full h-full rounded-full"
          resizeMode="stretch"
        />
      ) : (
        <Text className={`font-semibold ${largeText ? 'text-2xl' : 'text-lg'}`}>
          {getInitials(displayName)}
        </Text>
      )}
    </View>
  )
}

export default ProfileAvatar
