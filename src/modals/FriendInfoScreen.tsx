import * as React from 'react'
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

import { EvilIcons } from '@expo/vector-icons'
import { type RouteProp } from '@react-navigation/native'
import { type StackNavigationProp } from '@react-navigation/stack'
import Toast from 'react-native-toast-message'

import ProfileAvatar from '../components/ProfileAvatar'
import UButton from '../components/UButton'
import { type ModalStack } from '../navigation/navigation'
import { addFriend, getUser } from '../redux/actions/userActions'
import { type User } from '../redux/models/userModel'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'

type ScreenRouteProp = RouteProp<ModalStack, 'FriendInfoModal'>
type ScreenNavigationProp = StackNavigationProp<ModalStack, 'FriendInfoModal'>

interface Props {
  navigation: ScreenNavigationProp
  route: ScreenRouteProp
}

const FriendInfoScreenModal = ({ navigation, route }: Props) => {
  const { friendUid } = route.params

  const profile = useAppSelector(UserSelectors.selectUser)
  const [friend, setFriend] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isAddFriendLoading, setIsAddFriendLoading] = React.useState(false)
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    navigation.setOptions({
      title: 'Add a new friend',
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
  }, [navigation])

  React.useEffect(() => {
    async function getFriendData() {
      if (friendUid == null) {
        return
      }
      setIsLoading(true)
      try {
        const response = await dispatch(getUser({ userUid: friendUid }))
        setFriend(response.payload as User)
      } finally {
        setIsLoading(false)
      }
    }

    getFriendData()
  }, [friendUid])

  const onAddFriendPress = React.useCallback(async () => {
    if (profile == null || friendUid == null) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Something went wrong. Please try again later',
      })
      return
    }

    setIsAddFriendLoading(true)
    await dispatch(addFriend({ userUid: profile.uid, friendUserId: friendUid }))
    setIsAddFriendLoading(false)
    navigation.goBack()
  }, [navigation, dispatch, profile, friendUid])

  return (
    <SafeAreaView className="flex-1 p-5 bg-white">
      {isLoading || friend == null ? (
        <ActivityIndicator className="absolute left-0 right-0 top-0 bottom-0" size={'large'} />
      ) : (
        <View className="flex-1 p-5">
          <View className="flex-1 items-center">
            <View className="items-center">
              <ProfileAvatar
                photoUrl={friend.photoUrl}
                displayName={friend.displayName}
                customClassName="h-24 w-24"
              />
              <Text className="px-2 font-bold text-lg">{friend.displayName}</Text>
            </View>
            <View className="flex-row items-center">
              <EvilIcons name="envelope" size={24} />
              <Text>{friend.email}</Text>
            </View>
            <View className="mt-5 self-start">
              <Text className="font-bold text-lg">{'Bio'}</Text>
              <Text>
                {friend.aboutMe.length > 0
                  ? friend.aboutMe
                  : "Hello there! I'm new here and looking forward to connecting with others."}
              </Text>
            </View>
          </View>
          <UButton
            loading={isAddFriendLoading}
            buttonTitle="Add friend"
            variant="primary"
            onButtonPress={onAddFriendPress}
          />
        </View>
      )}
    </SafeAreaView>
  )
}

export default FriendInfoScreenModal
