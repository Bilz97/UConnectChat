import * as React from 'react'
import { FlatList, SafeAreaView, Text, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'

import SearchBar from '../components/SearchBar'
import { type AppTabStack } from '../navigation/navigation'
import { getMyFriends } from '../redux/actions/userActions'
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
            <View className="border p-5 mr-2 ">
              <Text>{item.displayName}</Text>
              <Text>{item.email}</Text>
            </View>
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
