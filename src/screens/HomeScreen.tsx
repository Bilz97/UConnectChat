import * as React from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { Feather } from '@expo/vector-icons'
import { type StackNavigationProp } from '@react-navigation/stack'
import * as ImagePicker from 'expo-image-picker'
import { updateProfile } from 'firebase/auth'
import Toast from 'react-native-toast-message'

import SearchBar from '../components/SearchBar'
import { type AppTabStack } from '../navigation/navigation'
import {
  enterChatRoom,
  getMyChatPreviews,
  getMyFriends,
  getUser,
  readyChatRoom,
  updateProfilePhoto,
} from '../redux/actions/userActions'
import { type ChatRoomPreview, type User } from '../redux/models/userModel'
import { updateUserPhoto, UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'
import { auth } from '../services/firebase'
import { getInitials } from '../util/chatHelper'

type ScreenNavigationProp = StackNavigationProp<AppTabStack, 'Home'>

interface Props {
  navigation: ScreenNavigationProp
}

const HomeScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch()
  const profile = useAppSelector(UserSelectors.selectUser)
  const myFriends = useAppSelector(UserSelectors.selectMyFriends)
  const myChatPreviews = useAppSelector(UserSelectors.selectMyChatPreviews)
  const [isPhotoLoading, setIsPhotoLoading] = React.useState(false)
  const [chatPreviewList, setChatPreviewList] = React.useState<ChatRoomPreview[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  if (profile === null) {
    return
  }

  const getChatPreviews = React.useCallback(() => {
    if (myChatPreviews === null) {
      return
    }
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

    openChatsPromise.then((chats) => {
      setChatPreviewList(chats)
    })
  }, [myChatPreviews])

  React.useEffect(() => {
    async function getData() {
      if (profile === null) {
        return
      }
      setIsLoading(true)
      await dispatch(getMyFriends({ userUid: profile.uid }))
      await dispatch(getMyChatPreviews({ userUid: profile.uid }))
      setIsLoading(false)
    }
    getData()
  }, [profile])

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

                navigation.getParent()?.navigate('Modals', {
                  screen: 'ChatRoomModal',
                  params: {
                    name: friend.displayName,
                    friendId: friend.uid,
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
          <View className="rounded-full justify-center items-center mr-2 border h-12 w-12">
            {item?.friend.photoUrl !== null ? (
              <Image
                source={{ uri: item.friend.photoUrl }}
                className="w-12 h-12 rounded-full"
                resizeMode="stretch"
              />
            ) : (
              <Text className="font-semibold text-lg">
                {getInitials(item?.friend?.displayName)}
              </Text>
            )}
          </View>
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

        {isLoading ? (
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
  }, [chatPreviewList])

  const pickImage = React.useCallback(async () => {
    setIsPhotoLoading(true)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    })

    console.log(result)

    if (!result.canceled && result.assets?.[0].type === 'image') {
      const photoUrl = result.assets[0].uri

      const user = auth.currentUser
      if (user !== null) {
        try {
          await updateProfile(user, {
            photoURL: photoUrl,
          })

          await dispatch(updateProfilePhoto({ userUid: profile.uid, photoUrl }))

          dispatch(updateUserPhoto(photoUrl))
        } catch {
          Toast.show({
            type: 'error',
            text1: 'Error!',
            text2: 'Could not save profile photo. Please try again later.',
          })
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Could not save profile photo. Please try again later.',
        })
      }
    }
    setIsPhotoLoading(false)
  }, [dispatch, profile, auth])

  const welcomeMessage = React.useCallback(() => {
    return (
      <View className="flex-row items-center mb-5">
        <TouchableOpacity
          disabled={isPhotoLoading}
          onPress={pickImage}
          className="h-20 w-20 border items-center justify-center rounded-full"
        >
          {isPhotoLoading ? (
            <ActivityIndicator size={'small'} />
          ) : profile?.photoUrl !== null ? (
            <Image
              source={{ uri: profile.photoUrl }}
              className="w-full h-full rounded-full"
              resizeMode="stretch"
            />
          ) : (
            <Feather name="user-plus" size={48} />
          )}
        </TouchableOpacity>
        <Text className="px-2 font-bold text-lg">{`Welcome ${profile.displayName}`}</Text>
      </View>
    )
  }, [profile?.photoUrl, isPhotoLoading])

  return (
    <SafeAreaView className="flex-1 m-5">
      <View className={'flex-1'}>
        {welcomeMessage()}
        <SearchBar />
        {myFriendsList()}
        {myMessages()}
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen
