import { memo } from 'react'
import * as React from 'react'
import { Text, TouchableOpacity } from 'react-native'

type ButtonVariant = 'primary' | 'secondary'

interface Props {
  variant: ButtonVariant
  buttonTitle: string
  onButtonPress: () => void
  disabled?: boolean
}
const UButton = ({ variant, buttonTitle, onButtonPress, disabled = false }: Props) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        disabled={disabled}
        className={`h-10 bg-gray-900 items-center justify-center rounded-md border border-black ${
          disabled && 'opacity-50'
        } `}
        onPress={onButtonPress}
      >
        <Text className="text-xl font-semibold text-gray-200">{buttonTitle}</Text>
      </TouchableOpacity>
    )
  } else return null
}

export default memo(UButton)
