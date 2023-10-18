import { memo } from 'react'
import * as React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

type ButtonVariant = 'primary' | 'secondary'

interface Props {
  variant: ButtonVariant
  buttonTitle: string
  onButtonPress: () => void
  disabled?: boolean
  loading?: boolean
}
const UButton = ({ variant, buttonTitle, onButtonPress, disabled = false, loading }: Props) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        disabled={disabled || loading}
        className={`h-10 bg-gray-900 items-center justify-center rounded-md border border-black ${
          (disabled || loading) && 'opacity-50'
        } `}
        onPress={onButtonPress}
      >
        <View className="flex-row items-center">
          <Text className="text-xl font-semibold text-gray-200">{buttonTitle}</Text>
          {loading && <ActivityIndicator className="ml-2" size="small" color="white" />}
        </View>
      </TouchableOpacity>
    )
  } else return null
}

export default memo(UButton)
