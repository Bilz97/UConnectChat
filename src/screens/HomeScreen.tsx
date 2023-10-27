import * as React from 'react'
import { Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'

import SearchBar from '../components/SearchBar'
import { type AppTabStack } from '../navigation/navigation'
import {
  enterChatRoom,
  getMyChatPreviews,
  getMyFriends,
  getUser,
  readyChatRoom,
} from '../redux/actions/userActions'
import { type ChatRoomPreview, type User } from '../redux/models/userModel'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'
import { getInitials } from '../util/chatHelper'

type ScreenNavigationProp = StackNavigationProp<AppTabStack, 'Home'>

interface Props {
  navigation: ScreenNavigationProp
}

const HomeScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch()
  const profile = useAppSelector(UserSelectors.selectUser)
  const myFriends = useAppSelector(UserSelectors.selectMyFriends)
  const myChatRooms = useAppSelector(UserSelectors.selectMyChatPreviews)

  const [chatPreviewList, setChatPreviewList] = React.useState<ChatRoomPreview[]>([])

  if (profile === null) {
    return
  }

  const getChatRooms = React.useCallback(() => {
    if (myChatRooms === null) {
      return
    }
    const openChatsPromise = Promise.all(
      myChatRooms.map(async (room) => {
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

    openChatsPromise.then((chats) => {
      setChatPreviewList(chats)
    })
  }, [myChatRooms])

  React.useEffect(() => {
    async function getData() {
      if (profile === null) {
        return
      }
      await dispatch(getMyFriends({ userUid: profile.uid }))
      await dispatch(getMyChatPreviews({ userUid: profile.uid }))
    }
    getData()
  }, [profile])

  React.useEffect(() => {
    getChatRooms()
  }, [myChatRooms])

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

                navigation.getParent()?.navigate('Modals', {
                  screen: 'ChatRoomModal',
                  params: {
                    name: friend.displayName,
                    friendId: friend.uid,
                  },
                })
              } catch (err) {
                console.log('*** error ', err)
              }
            },
          },
          {
            text: 'Remove Friend',
            style: 'destructive',
            onPress: () => {
              console.log('Option 2 selected')
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              console.log('Option 3 selected')
            },
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
        navigation.getParent()?.navigate('Modals', {
          screen: 'ChatRoomModal',
          params: {
            name: preview.friend.displayName,
            friendId: preview.friend.uid,
          },
        })
      } catch {
        // do nothing
      }
    },
    [dispatch]
  )

  const myFriendsList = React.useCallback(() => {
    return (
      <View className="mt-5">
        <Text className="text-lg font-bold">{'My friends'}</Text>
        <FlatList
          className="mt-2"
          data={myFriends}
          horizontal
          extraData={myFriends}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
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
      </View>
    )
  }, [myFriends])

  const renderChatPreviewItems = React.useCallback(({ item }: { item: ChatRoomPreview }) => {
    return (
      <TouchableOpacity
        onPress={async () => {
          await onChatPreviewPress(item)
        }}
        className="flex-row items-center"
      >
        <View className="rounded-full justify-center items-center mr-2 border h-12 w-12">
          <Text className="font-semibold text-lg">{getInitials(item?.friend?.displayName)}</Text>
        </View>
        <View>
          <Text className="font-semibold">{item.friend.displayName}</Text>
          <Text className="text-sm">{`${
            item.lastMessage?.sender === profile.uid ? 'You' : item.friend.displayName
          }: ${item.lastMessage?.text}`}</Text>
        </View>
      </TouchableOpacity>
    )
  }, [])

  const myMessages = () => {
    return (
      <View className="mt-5">
        <Text className="text-lg font-bold">{'My Messages'}</Text>

        <FlatList
          className="mt-2"
          data={chatPreviewList}
          ItemSeparatorComponent={() => <View className="h-5" />}
          renderItem={renderChatPreviewItems}
        />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 m-5">
      <View className={'flex-1'}>
        <SearchBar />
        {myFriendsList()}
        {myMessages()}
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen
