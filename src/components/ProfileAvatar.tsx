import { memo } from 'react'
import * as React from 'react'
import { Image, Text, View } from 'react-native'

import { type User } from '../redux/models/userModel'
import { getInitials } from '../util/chatHelper'

interface Props {
  profile: User
  isCurrentUser: boolean
}
const ProfileAvatar = ({ profile, isCurrentUser }: Props) => {
  return (
    <View
      className={`rounded-full justify-center items-center ${
        isCurrentUser ? 'ml-2' : 'mr-2'
      } border h-12 w-12`}
    >
      {profile?.photoUrl !== null ? (
        <Image
          source={{ uri: profile.photoUrl }}
          className="w-full h-full rounded-full"
          resizeMode="stretch"
        />
      ) : (
        <Text className="font-semibold text-lg">{getInitials(profile?.displayName)}</Text>
      )}
    </View>
  )
}

export default memo(ProfileAvatar)
