import * as React from 'react'
import { SafeAreaView, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'

import NavBarOption from '../components/NavBarOption'
import { type AppTabStack } from '../navigation/navigation'
import { logoutUser } from '../redux/actions/userActions'
import { useAppDispatch } from '../redux/store/hooks'

type SettingsScreenNavigationProp = StackNavigationProp<AppTabStack, 'Settings'>

const SettingsScreen = ({ navigation }: { navigation: SettingsScreenNavigationProp }) => {
  const dispatch = useAppDispatch()

  const logout = React.useCallback(async () => {
    await dispatch(logoutUser()).then(() => navigation.getParent()?.navigate('Auth'))
  }, [navigation, dispatch])

  return (
    <SafeAreaView className="flex-1 m-5">
      <View className={'flex-1 items-center'}>
        <NavBarOption
          title="Personal information"
          onPress={() => {
            console.log('PI')
          }}
        />
        <NavBarOption title="Logout" onPress={logout} />
      </View>
    </SafeAreaView>
  )
}

export default SettingsScreen
