import * as React from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { EvilIcons } from '@expo/vector-icons'
import { type RouteProp } from '@react-navigation/native'
import { type StackNavigationProp } from '@react-navigation/stack'
import { useFormik } from 'formik'
import Toast from 'react-native-toast-message'

import { type ModalStack } from '../navigation/navigation'
import { getUser, sendMessage } from '../redux/actions/userActions'
import { type Message, type User } from '../redux/models/userModel'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'

type ScreenRouteProp = RouteProp<ModalStack, 'ChatRoomModal'>
type ScreenNavigationProp = StackNavigationProp<ModalStack, 'ChatRoomModal'>

interface Props {
  navigation: ScreenNavigationProp
  route: ScreenRouteProp
}

const ChatScreenModal = ({ navigation, route }: Props) => {
  const { name, friendId, chatRoom } = route.params
  const [messages, setMessages] = React.useState<Message[]>(chatRoom?.messages ?? [])

  const screenHeight = Dimensions.get('window').height
  const keyboardOffset = screenHeight * 0.11
  const dispatch = useAppDispatch()
  const profile = useAppSelector(UserSelectors.selectUser)
  const [isLoading, setIsLoading] = React.useState(false)
  const [friendData, setFriendData] = React.useState<User>()

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

  React.useEffect(() => {
    async function getFriendData() {
      if (!friendId) {
        return
      }
      const friendData = await dispatch(getUser({ userUid: friendId }))
      if (friendData.payload !== null && friendData.payload !== undefined) {
        setFriendData(friendData.payload as User)
      }
    }

    getFriendData()
  }, [])

  const { values, handleSubmit, handleChange, resetForm } = useFormik({
    initialValues: {
      message: '',
    },
    onSubmit: async (formValues) => {
      if (!friendId || !chatRoom?.id) {
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
          sendMessage({
            userUid: profile.uid,
            displayName: profile.displayName,
            roomId: chatRoom?.id,
            message: formValues.message,
          })
        )
      }
      resetForm()
      setIsLoading(false)
    },
  })

  const getInitials = (text: string): string => {
    if (!text) return ''

    const initials = text
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()

    return initials
  }

  const renderItem = React.useCallback(
    ({ item }: { item: Message }) => {
      const dateTime = new Date(item.timestamp)
      const currentDate = new Date()
      const isToday =
        dateTime.getDay() === currentDate.getDay() &&
        dateTime.getMonth() === currentDate.getMonth() &&
        dateTime.getFullYear() === currentDate.getFullYear()

      if (item.sender === profile.uid) {
        return (
          <View className="items-center">
            {!isToday && <Text className={'mb-2'}>{dateTime.toLocaleString()}</Text>}
            <View className="flex-row self-end items-end" style={{ maxWidth: '100%' }}>
              <View
                className={'ml-1 border-0.5 p-2 rounded-lg bg-white'}
                style={{ maxWidth: '80%' }}
              >
                <Text className={'flex-wrap'}>{item.text}</Text>
              </View>
              <View className="rounded-full justify-center items-center ml-2 border h-12 w-12">
                <Text className="font-semibold text-lg">{getInitials(item.displayName)}</Text>
              </View>
            </View>
          </View>
        )
      }
      return (
        <View className="items-center">
          {!isToday && <Text className={'mb-2'}>{dateTime.toLocaleString()}</Text>}
          <View className="flex-row self-start items-end" style={{ maxWidth: '100%' }}>
            <View className="rounded-full justify-center items-center mr-2 border h-12 w-12">
              <Text className="font-semibold text-lg">{getInitials(item.displayName)}</Text>
            </View>
            <View
              className={'mr-1 border-0.5 p-2 rounded-lg bg-gray-50'}
              style={{ maxWidth: '80%' }}
            >
              <Text className={'flex-wrap mr-1'}>{item.text}</Text>
            </View>
          </View>
        </View>
      )
    },
    [profile.uid]
  )

  const chatView = React.useCallback(() => {
    return (
      <View className="bg-gray-100 flex-1 px-5 pt-5">
        <FlatList
          showsVerticalScrollIndicator={false}
          data={messages}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={renderItem}
        />
      </View>
    )
  }, [])

  const chatInputView = React.useCallback(() => {
    return (
      <View className="bg-white h-14 flex-row items-center rounded-t-md">
        <TextInput
          multiline
          className="px-5 h-12 flex-1"
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
