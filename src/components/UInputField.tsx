import { memo } from 'react'
import * as React from 'react'
import { Text, TextInput, View } from 'react-native'

interface Props {
  labelTitle: string
  placeholder: string
  inputValue: string
  onChangeText: (value: string) => void
  secure?: boolean
  lines?: number
  multiLine?: boolean
  customInputClass?: string
  editable?: boolean
  maxLength?: number
  showCharacterLimit?: boolean
}

const UInputField = ({
  labelTitle,
  placeholder,
  inputValue,
  onChangeText,
  secure,
  lines,
  multiLine,
  customInputClass = '',
  editable = true,
  maxLength = 20,
  showCharacterLimit = false,
}: Props) => {
  return (
    <View className="mb-2">
      <Text className="text-gray-700 text-lg font-semibold">{labelTitle}</Text>
      <TextInput
        className={`p-1 border-0.5 border-gray-300 h-10 rounded-sm ${customInputClass} ${
          editable ? 'bg-gray-50' : 'bg-gray-200'
        }`}
        placeholder={placeholder}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        value={inputValue}
        multiline={multiLine}
        numberOfLines={lines}
        editable={editable}
        maxLength={maxLength}
      />
      {showCharacterLimit && (
        <Text className="self-end">{`${inputValue?.length ?? 0}/${maxLength}`}</Text>
      )}
    </View>
  )
}

export default memo(UInputField)
