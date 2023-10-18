import { memo } from 'react'
import * as React from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { EvilIcons } from '@expo/vector-icons'
import { useFormik } from 'formik'

import { addFriend, searchUsers } from '../redux/actions/userActions'
import { type User } from '../redux/models/userModel'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'

const SearchBar = () => {
  const dispatch = useAppDispatch()
  const [searchResults, setSearchResults] = React.useState<User[]>([])
  const profile = useAppSelector(UserSelectors.selectUser)

  const { values, handleChange, handleSubmit } = useFormik({
    initialValues: {
      search: '',
    },
    onSubmit: async (value) => {
      console.log('*** search: ', value.search)
      if (value.search.length < 3) {
        setSearchResults([])
        return
      }
      try {
        const users = await dispatch(
          searchUsers({ userUid: profile.uid, displayName: value.search })
        )
        setSearchResults(users.payload as User[])
      } catch (err) {
        console.log('err: ', err)
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
          placeholder={'search for friends'}
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

export default memo(SearchBar)
