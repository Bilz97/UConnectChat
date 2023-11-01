import * as React from 'react'
import { Image, Text, View } from 'react-native'

import { getInitials } from '../util/chatHelper'

interface Props {
  photoUrl: string | null
  displayName: string

  large?: boolean
  customClassName?: string
}
const ProfileAvatar = ({
  photoUrl,
  displayName,

  large = false,
  customClassName = '',
}: Props) => {
  return (
    <View
      className={`rounded-full justify-center items-center border  ${
        large ? 'h-20 w-20' : 'h-12 w-12'
      } ${customClassName} `}
    >
      {photoUrl !== null ? (
        <Image
          source={{ uri: photoUrl }}
          className="w-full h-full rounded-full"
          resizeMode="stretch"
        />
      ) : (
        <Text className={`font-semibold ${large ? 'text-2xl' : 'text-lg'}`}>
          {getInitials(displayName)}
        </Text>
      )}
    </View>
  )
}

export default ProfileAvatar
