import { memo } from 'react'
import * as React from 'react'
import { Image, Text, View } from 'react-native'

import { getInitials } from '../util/chatHelper'

interface Props {
  photoUrl: string | null
  displayName: string
  addLeftPadding: boolean
  customSize: number | null
}
const ProfileAvatar = ({ photoUrl, displayName, addLeftPadding, customSize: size }: Props) => {
  const imageSize: string = size !== null ? `h-${size} w-${size}` : 'h-12 w-12'
  console.log('*** imageSize: ', imageSize)
  return (
    <View
      className={`rounded-full justify-center items-center ${
        addLeftPadding ? 'ml-2' : 'mr-2'
      } border ${imageSize} w-20 h-20`}
    >
      {photoUrl !== null ? (
        <Image
          source={{ uri: photoUrl }}
          className="w-full h-full rounded-full"
          resizeMode="stretch"
        />
      ) : (
        <Text className={`font-semibold ${size !== null && size > 15 ? 'text-2xl' : 'text-lg'}`}>
          {getInitials(displayName)}
        </Text>
      )}
    </View>
  )
}

export default memo(ProfileAvatar)
