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

import { AntDesign, EvilIcons } from '@expo/vector-icons'
import { type RouteProp } from '@react-navigation/native'
import { type StackNavigationProp } from '@react-navigation/stack'
import { useFormik } from 'formik'
import Toast from 'react-native-toast-message'

import ProfileAvatar from '../components/ProfileAvatar'
import { type ModalStack } from '../navigation/navigation'
import {
  getMyChatPreviews,
  getUser,
  refetchChatRoom,
  sendMessage,
} from '../redux/actions/userActions'
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
  const { name, friendUid } = route.params

  const chatRoom = useAppSelector(UserSelectors.selectActiveChatRoom)
  const profile = useAppSelector(UserSelectors.selectUser)

  const screenHeight = Dimensions.get('window').height
  const keyboardOffset = screenHeight * 0.11

  const dispatch = useAppDispatch()

  const [isSendingMessage, setIsSendingMessage] = React.useState(false)
  const [friendData, setFriendData] = React.useState<User | null>(null)
  const scrollRef = React.useRef<FlatList>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    navigation.setOptions({
      title: name,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack()
          }}
        >
          <AntDesign
            onPress={() => {
              navigation.navigate('AudioVideoModal', { friendUid: friendData?.uid })
            }}
            name="phone"
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack()
          }}
        >
          <EvilIcons name="close" size={24} color="gray" />
        </TouchableOpacity>
      ),
    })
  }, [navigation, name])

  React.useEffect(() => {
    async function getFriendData() {
      if (friendUid == null) {
        return
      }
      setIsLoading(true)
      const user = await dispatch(getUser({ userUid: friendUid }))
      if (user.payload !== null && user.payload !== undefined) {
        setFriendData(user.payload as User)
      }
      setIsLoading(false)
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
    getFriendData()
  }, [friendUid, dispatch])

  React.useEffect(() => {
    if (scrollRef.current !== null) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [chatRoom])

  if (profile == null || chatRoom == null) {
    return
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async () => {
      await dispatch(getMyChatPreviews({ userUid: profile.uid }))
    })

    return unsubscribe
  }, [profile.uid, dispatch])

  const { values, handleSubmit, handleChange, resetForm } = useFormik({
    initialValues: {
      message: '',
    },
    onSubmit: async (formValues) => {
      if (friendUid == null) {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Something went wrong. Please try again later.',
        })
        return
      }
      setIsSendingMessage(true)
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
            roomId: chatRoom.roomName,
            message: formValues.message,
          })
        )
        await dispatch(refetchChatRoom({ roomId: chatRoom.roomName }))
      }
      resetForm()
      setIsSendingMessage(false)
    },
  })

  const renderItem = React.useCallback(
    ({ item }: { item: Message }) => {
      const dateTime = new Date(item.timestamp)

      return (
        <View className="items-center mb-1">
          <Text
            className={'mt-2 mb-1'}
          >{`${dateTime.toDateString()} at ${dateTime.toLocaleTimeString()}`}</Text>
          {item.sender === profile.uid ? (
            <View className="flex-row self-end items-end" style={{ maxWidth: '100%' }}>
              <View
                className={'ml-1 border-0.5 p-2 rounded-lg bg-white'}
                style={{ maxWidth: '80%' }}
              >
                <Text className={'flex-wrap'}>{item.text}</Text>
              </View>
              <ProfileAvatar
                photoUrl={profile?.photoUrl ?? null}
                displayName={profile.displayName}
                customClassName="ml-2 w-12 h-12"
              />
            </View>
          ) : (
            <View className="flex-row self-start items-end" style={{ maxWidth: '100%' }}>
              {friendData !== null && (
                <ProfileAvatar
                  photoUrl={friendData?.photoUrl ?? null}
                  displayName={friendData.displayName}
                  customClassName="mr-2 w-12 h-12"
                />
              )}
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
    [profile, friendData]
  )

  const chatView = React.useCallback(() => {
    return (
      <View className="bg-gray-100 flex-1 px-5">
        {isLoading || friendData == null ? (
          <ActivityIndicator size={'large'} className="absolute left-0 right-0 top-0 bottom-0" />
        ) : (
          <FlatList
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            data={chatRoom.messages}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={renderItem}
          />
        )}
      </View>
    )
  }, [chatRoom.messages, friendData, isLoading])

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
        {isSendingMessage ? (
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
  }, [values, handleChange, isSendingMessage])

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
