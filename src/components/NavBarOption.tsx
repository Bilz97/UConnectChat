import { memo } from 'react'
import * as React from 'react'
import { Text, TouchableOpacity } from 'react-native'

import { EvilIcons } from '@expo/vector-icons'

interface Props {
  title: string
  onPress: () => void
}

const NavBarOption = ({ title, onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row justify-between border w-full mb-5 p-5 border-gray-300 rounded-md"
    >
      <Text className="text-lg ">{title}</Text>

      <EvilIcons name="chevron-right" size={36} color="gray" />
    </TouchableOpacity>
  )
}

export default memo(NavBarOption)
