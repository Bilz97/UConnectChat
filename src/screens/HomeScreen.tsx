import * as React from 'react'
import { Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'

import SearchBar from '../components/SearchBar'
import { type AppTabStack } from '../navigation/navigation'
import { getMyFriends, readyChatRoom } from '../redux/actions/userActions'
import { type User } from '../redux/models/userModel'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'

type HomeScreenNavigationProp = StackNavigationProp<AppTabStack, 'Home'>

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
  const dispatch = useAppDispatch()
  const profile = useAppSelector(UserSelectors.selectUser)
  const myFriends = useAppSelector(UserSelectors.selectMyFriends)

  React.useEffect(() => {
    async function getFriends() {
      await dispatch(getMyFriends({ userUid: profile.uid }))
    }
    getFriends()
  }, [])

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
                const chatRoom = await dispatch(
                  readyChatRoom({ userUid: profile.uid, friendUserId: friend.uid })
                )

                navigation.getParent()?.navigate('Modals', {
                  screen: 'ChatRoomModal',
                  params: {
                    name: friend.displayName,
                    friendId: friend.uid,
                    chatRoom: chatRoom.payload,
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
              // Handle Option 2 action here
              console.log('Option 2 selected')
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              // Handle Option 3 action here
              console.log('Option 3 selected')
            },
          },
        ],
        { cancelable: true } // Set to true if you want to allow cancelling the alert by tapping outside
      )
    },
    [dispatch, profile.uid]
  )

  const myFriendsList = React.useCallback(() => {
    return (
      // flat list horizontal with list of friends
      <View className="mt-5">
        <Text className="text-lg font-bold">{'My friends'}</Text>

        <FlatList
          data={myFriends}
          horizontal
          extraData={myFriends}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              className="border p-5 mr-2"
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

  const myMessages = () => {
    return (
      // flat list horizontal with list of friends
      <View className="mt-5">
        <Text className="text-lg font-bold">{'My Messages'}</Text>
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
