import { memo } from 'react'
import * as React from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { EvilIcons } from '@expo/vector-icons'
import { useFormik } from 'formik'
import Toast from 'react-native-toast-message'

import { addFriend, searchUsers } from '../redux/actions/userActions'
import { type User } from '../redux/models/userModel'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'

const SearchForFriends = () => {
  const dispatch = useAppDispatch()
  const [searchResults, setSearchResults] = React.useState<User[]>([])
  const profile = useAppSelector(UserSelectors.selectUser)

  if (profile == null) {
    return
  }

  const { values, handleChange, handleSubmit, resetForm } = useFormik({
    initialValues: {
      search: '',
    },
    onSubmit: async (value) => {
      if (value.search.length < 3) {
        setSearchResults([])
        return
      }
      try {
        const usersData = await dispatch(
          searchUsers({ userUid: profile.uid, displayName: value.search })
        )
        const users = usersData.payload as User[]

        setSearchResults(users)
        if (users.length === 0) {
          Toast.show({
            type: 'info',
            text1: 'User not found',
            text2: 'There appears to be no user with this name.',
          })
        }
        resetForm()
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Something went wrong. Please try again later.',
        })
      }
    },
  })

  const onFriendPress = React.useCallback(
    async (friendUid: string) => {
      await dispatch(addFriend({ userUid: profile.uid, friendUserId: friendUid }))
      setSearchResults([])
    },
    [dispatch]
  )

  return (
    <View className="items-center">
      <View className="flex-row border rounded-sm border-gray-700 bg-white items-center">
        <TextInput
          maxLength={20}
          className="px-2 bg-gray-50 h-12 flex-1 bg-transparent"
          placeholder={'search for new friends'}
          onChangeText={handleChange('search')}
          value={values.search}
        />
        <TouchableOpacity
          onPress={() => {
            handleSubmit()
          }}
          className="p-2"
        >
          <EvilIcons name="search" size={28} color="gray" />
        </TouchableOpacity>
      </View>
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          className="border border-gray-400 rounded-md bg-white w-full mt-1 px-2"
          contentContainerStyle={{ justifyContent: 'center' }}
          ItemSeparatorComponent={() => <View className="w-full border-0.5" />}
          ListEmptyComponent={null}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              className={'my-2'}
              onPress={() => {
                onFriendPress(item.uid)
              }}
            >
              <View className="flex-row">
                <Text className="font-semibold">{'Name: '}</Text>
                <Text>{item.displayName}</Text>
              </View>
              <View className="flex-row">
                <Text className="font-semibold">{'Email: '}</Text>
                <Text>{item.email}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

export default memo(SearchForFriends)
