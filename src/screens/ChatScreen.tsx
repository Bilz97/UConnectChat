import * as React from 'react'
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { EvilIcons } from '@expo/vector-icons'
import { type StackScreenProps } from '@react-navigation/stack'
import { useFormik } from 'formik'
import Toast from 'react-native-toast-message'

import { type ModalStack } from '../navigation/navigation'
import { sendMessage } from '../redux/actions/userActions'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'

type Props = StackScreenProps<ModalStack, 'ChatRoomModal'>

const ChatScreenModal = ({ navigation, route }: Props) => {
  const { name, friendId, chatRoom } = route.params
  const screenHeight = Dimensions.get('window').height
  const keyboardOffset = screenHeight * 0.11
  const dispatch = useAppDispatch()
  const profile = useAppSelector(UserSelectors.selectUser)
  const [isLoading, setIsLoading] = React.useState(false)
  React.useEffect(() => {
    navigation.setOptions({
      title: name,
      headerLeft: () => (
        <TouchableOpacity
          className="relative -left-5"
          onPress={() => {
            navigation.goBack()
          }}
        >
          <EvilIcons name="chevron-left" size={38} color="gray" />
        </TouchableOpacity>
      ),
    })
  }, [navigation, name])

  console.log('*** chatRoom Screen: ', chatRoom)
  const { values, handleSubmit, handleChange, resetForm } = useFormik({
    initialValues: {
      message: '',
    },
    onSubmit: async (formValues) => {
      if (!profile.uid || !friendId) {
        return
      }
      setIsLoading(true)
      if (formValues.message?.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Message field must not be empty',
        })
      } else {
        console.log('*** send: ', formValues.message)
        await dispatch(
          sendMessage({ userUid: profile.uid, friendUserId: friendId, message: formValues.message })
        )
      }
      resetForm()
      setIsLoading(false)
    },
  })

  const chatView = React.useCallback(() => {
    return <View className="bg-gray-100 flex-1"></View>
  }, [])

  const chatInputView = React.useCallback(() => {
    return (
      <View className="bg-white h-14 flex-row items-center">
        <TextInput
          className="px-5 h-12 flex-1 "
          placeholder={'Type your message...'}
          onChangeText={handleChange('message')}
          value={values.message}
        />
        {isLoading ? (
          <ActivityIndicator size={'small'} />
        ) : (
          <EvilIcons
            onPress={() => {
              handleSubmit()
            }}
            name="arrow-right"
            size={36}
            color="gray"
          />
        )}
      </View>
    )
  }, [values, handleChange, isLoading])

  return (
    <SafeAreaView className="flex-1 p-5 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        keyboardVerticalOffset={keyboardOffset}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {chatView()}
        {chatInputView()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default ChatScreenModal
