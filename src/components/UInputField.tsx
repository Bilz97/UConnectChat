import { memo } from 'react'
import * as React from 'react'
import { Text, TextInput, View } from 'react-native'

interface Props {
  labelTitle: string
  placeholder: string
  inputValue: string
  onChangeText: (value: string) => void
  secure?: boolean
}

const UInputField = ({ labelTitle, placeholder, inputValue, onChangeText, secure }: Props) => {
  return (
    <View className="mb-2">
      <Text className="text-gray-700 text-lg font-semibold">{labelTitle}</Text>
      <TextInput
        className="p-1 bg-gray-50 h-10 "
        placeholder={placeholder}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        value={inputValue}
      />
    </View>
  )
}

export default memo(UInputField)
