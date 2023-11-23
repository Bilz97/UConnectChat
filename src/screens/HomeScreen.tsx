import * as React from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'

import ProfileAvatar from '../components/ProfileAvatar'
import SearchForFriends from '../components/SearchForFriends'
import { type AppTabStack } from '../navigation/navigation'
import {
  enterChatRoom,
  getMyChatPreviews,
  getMyFriends,
  getUser,
  readyChatRoom,
  removeFriend,
} from '../redux/actions/userActions'
import { type ChatRoomPreview, type User } from '../redux/models/userModel'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'

type ScreenNavigationProp = StackNavigationProp<AppTabStack, 'Home'>

interface Props {
  navigation: ScreenNavigationProp
}

const HomeScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch()
  const profile = useAppSelector(UserSelectors.selectUser)
  const myFriends = useAppSelector(UserSelectors.selectMyFriends)
  const myChatPreviews = useAppSelector(UserSelectors.selectMyChatPreviews)
  const [chatPreviewList, setChatPreviewList] = React.useState<ChatRoomPreview[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isPreviewMessagesLoading, setIsPreviewMessagesLoading] = React.useState(false)

  if (profile == null) {
    return
  }

  const getChatPreviews = React.useCallback(() => {
    if (myChatPreviews === null) {
      return
    }

    setIsPreviewMessagesLoading(true)
    const openChatsPromise = Promise.all(
      myChatPreviews.map(async (room) => {
        const friendUid = room.roomName
          .split('-')
          .filter((value) => value !== 'room' && value !== profile.uid)?.[0]
        const friendData = await dispatch(getUser({ userUid: friendUid }))

        return {
          friend: friendData.payload as User,
          lastMessage: room.lastMessage,
          roomName: room.roomName,
        }
      })
    )

    openChatsPromise
      .then((chats) => {
        setChatPreviewList(chats)
      })
      .finally(() => {
        setIsPreviewMessagesLoading(false)
      })
  }, [myChatPreviews])

  React.useEffect(() => {
    async function getData() {
      if (profile == null) {
        return
      }
      setIsLoading(true)
      await dispatch(getMyFriends({ userUid: profile.uid }))
      await dispatch(getMyChatPreviews({ userUid: profile.uid }))
      setIsLoading(false)
    }
    getData()
  }, [profile, dispatch])

  React.useEffect(() => {
    getChatPreviews()
  }, [myChatPreviews])

  const onFriendPress = React.useCallback(
    (friend: User) => {
      Alert.alert(
        'Friend Options',
        'Please select one of the following options:',
        [
          {
            text: 'Chat with Friend',
            onPress: async () => {
              try {
                await dispatch(readyChatRoom({ userUid: profile.uid, friendUserId: friend.uid }))

                navigation.getParent()?.navigate('ModalStack', {
                  screen: 'ChatRoomModal',
                  params: {
                    name: friend.displayName,
                    friendUid: friend.uid,
                  },
                })
              } catch {
                // do nothing
              }
            },
          },
          {
            text: 'Remove Friend',
            style: 'destructive',
            onPress: async () => {
              console.log('Option 2 selected')
              await dispatch(removeFriend({ userUid: profile.uid, friendUserId: friend.uid }))
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      )
    },
    [dispatch, profile.uid]
  )

  const onChatPreviewPress = React.useCallback(
    async (preview: ChatRoomPreview) => {
      try {
        await dispatch(enterChatRoom({ roomName: preview.roomName }))
        navigation.getParent()?.navigate('ModalStack', {
          screen: 'ChatRoomModal',
          params: {
            name: preview.friend.displayName,
            friendUid: preview.friend.uid,
          },
        })
      } catch {
        // do nothing
      }
    },
    [dispatch, navigation]
  )

  const myFriendsList = React.useCallback(() => {
    return (
      <View className="mt-5">
        <Text className="text-lg font-bold">{'My friends'}</Text>
        {isLoading ? (
          <ActivityIndicator size={'small'} />
        ) : (
          <FlatList
            className="mt-2"
            data={myFriends}
            ListEmptyComponent={() => (
              <View>
                <Text>{'No friends found...'}</Text>
              </View>
            )}
            horizontal
            extraData={myFriends}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="border p-5 mr-2 bg-gray-50 rounded-lg"
                onPress={() => {
                  onFriendPress(item)
                }}
              >
                <Text>{item.displayName}</Text>
                <Text>{item.email}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    )
  }, [myFriends, isLoading])

  const renderChatPreviewItems = React.useCallback(
    ({ item }: { item: ChatRoomPreview }) => {
      return (
        <TouchableOpacity
          onPress={async () => {
            await onChatPreviewPress(item)
          }}
          className="flex-row items-center"
        >
          <ProfileAvatar
            photoUrl={item.friend.photoUrl}
            displayName={item.friend.displayName}
            size={12}
            customClassName="mr-2"
          />
          <View>
            <Text className="font-semibold">{item.friend?.displayName}</Text>
            <Text className="text-sm">{`${
              item.lastMessage?.sender === profile.uid ? 'You' : item.friend?.displayName
            }: ${item.lastMessage?.text}`}</Text>
          </View>
        </TouchableOpacity>
      )
    },
    [profile.uid]
  )

  const myMessages = React.useCallback(() => {
    return (
      <View className="mt-5">
        <Text className="text-lg font-bold">{'My Messages'}</Text>

        {isLoading || isPreviewMessagesLoading ? (
          <ActivityIndicator size={'small'} className="pt-5" />
        ) : (
          <FlatList
            className="mt-2"
            data={chatPreviewList}
            ListEmptyComponent={() => (
              <View>
                <Text>{'No messages found...'}</Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View className="h-5" />}
            renderItem={renderChatPreviewItems}
          />
        )}
      </View>
    )
  }, [chatPreviewList, isLoading, isPreviewMessagesLoading])

  const welcomeMessage = React.useCallback(() => {
    return (
      <View className="flex-row items-center mb-5">
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SettingsStack', {
              screen: 'Settings',
            })
          }}
        >
          <ProfileAvatar
            photoUrl={profile?.photoUrl ?? null}
            displayName={profile.displayName}
            size={20}
            customClassName="mr-2"
          />
        </TouchableOpacity>
        <Text className="font-bold text-lg">{`Hello ${profile.displayName}!`}</Text>
      </View>
    )
  }, [profile?.photoUrl, profile.displayName])

  return (
    <SafeAreaView className="flex-1 m-5">
      <View className={'flex-1'}>
        {welcomeMessage()}
        <SearchForFriends />
        {myFriendsList()}
        {myMessages()}
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen
