import { memo } from 'react'
import * as React from 'react'
import { Image, Text, View } from 'react-native'

import { type User } from '../redux/models/userModel'
import { getInitials } from '../util/chatHelper'

interface Props {
  profile: User
  addLeftPadding: boolean
  customSize: number | null
}
const ProfileAvatar = ({ profile, addLeftPadding, customSize: size }: Props) => {
  const imageSize: string = size !== null ? `h-${size} w-${size}` : 'h-12 w-12'

  return (
    <View
      className={`rounded-full justify-center items-center ${
        addLeftPadding ? 'ml-2' : 'mr-2'
      } border ${imageSize}`}
    >
      {profile?.photoUrl !== null ? (
        <Image
          source={{ uri: profile.photoUrl }}
          className="w-full h-full rounded-full"
          resizeMode="stretch"
        />
      ) : (
        <Text className={`font-semibold ${size !== null && size > 15 ? 'text-2xl' : 'text-lg'}`}>
          {getInitials(profile?.displayName)}
        </Text>
      )}
    </View>
  )
}

export default memo(ProfileAvatar)
