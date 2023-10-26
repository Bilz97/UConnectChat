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
import { getUser, refetchChatRoom, sendMessage } from '../redux/actions/userActions'
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
  const { name, friendId } = route.params

  const chatRoom = useAppSelector(UserSelectors.selectActiveChatRoom)
  const profile = useAppSelector(UserSelectors.selectUser)

  const screenHeight = Dimensions.get('window').height
  const keyboardOffset = screenHeight * 0.11

  const dispatch = useAppDispatch()

  const [isLoading, setIsLoading] = React.useState(false)
  const [friendData, setFriendData] = React.useState<User | null>(null)
  const scrollRef = React.useRef<FlatList>(null)

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
      const user = await dispatch(getUser({ userUid: friendId }))
      if (user.payload !== null && user.payload !== undefined) {
        setFriendData(user.payload as User)
      }
    }

    getFriendData()
  }, [friendId, dispatch])

  React.useEffect(() => {
    if (scrollRef.current !== null) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true })
      }, 200)
    }
  }, [chatRoom])

  const { values, handleSubmit, handleChange, resetForm } = useFormik({
    initialValues: {
      message: '',
    },
    onSubmit: async (formValues) => {
      if (!friendId) {
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
        await dispatch(
          sendMessage({
            userUid: profile.uid,
            displayName: profile.displayName,
            roomId: chatRoom.id,
            message: formValues.message,
          })
        )
        await dispatch(refetchChatRoom({ roomId: chatRoom.id }))
      }
      resetForm()
      setIsLoading(false)
    },
  })

  const getInitials = React.useCallback((text?: string): string => {
    if (!text) return ''

    const initials = text
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()

    return initials
  }, [])

  const renderItem = React.useCallback(
    ({ item }: { item: Message }) => {
      const dateTime = new Date(item.timestamp)
      // const currentDate = new Date()
      // const isToday =
      //   dateTime.getDay() === currentDate.getDay() &&
      //   dateTime.getMonth() === currentDate.getMonth() &&
      //   dateTime.getFullYear() === currentDate.getFullYear()
      return (
        <View className="items-center mb-1">
          <Text className={'mb-2'}>{dateTime.toLocaleString()}</Text>
          {item.sender === profile.uid ? (
            <View className="flex-row self-end items-end" style={{ maxWidth: '100%' }}>
              <View
                className={'ml-1 border-0.5 p-2 rounded-lg bg-white'}
                style={{ maxWidth: '80%' }}
              >
                <Text className={'flex-wrap'}>{item.text}</Text>
              </View>
              <View className="rounded-full justify-center items-center ml-2 border h-12 w-12">
                <Text className="font-semibold text-lg">{getInitials(profile?.displayName)}</Text>
              </View>
            </View>
          ) : (
            <View className="flex-row self-start items-end" style={{ maxWidth: '100%' }}>
              <View className="rounded-full justify-center items-center mr-2 border h-12 w-12">
                <Text className="font-semibold text-lg">
                  {getInitials(friendData?.displayName)}
                </Text>
              </View>
              <View
                className={'mr-1 border-0.5 p-2 rounded-lg bg-gray-50'}
                style={{ maxWidth: '80%' }}
              >
                <Text className={'flex-wrap mr-1'}>{item.text}</Text>
              </View>
            </View>
          )}
        </View>
      )
    },
    [profile.uid, profile.displayName, friendData?.displayName]
  )

  const chatView = React.useCallback(() => {
    return (
      <View className="bg-gray-100 flex-1 px-5 pt-5">
        <FlatList
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          data={chatRoom.messages}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={renderItem}
        />
      </View>
    )
  }, [chatRoom.messages, friendData])

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
