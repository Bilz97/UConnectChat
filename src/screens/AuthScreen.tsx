import * as React from 'react'
import { Text, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'
import { useFormik } from 'formik'
import { SafeAreaView } from 'react-native-safe-area-context'

import UButton from '../components/UButton'
import UInputField from '../components/UInputField'
import { type AuthStack } from '../navigation/navigation'

type LoginScreenNavigationProp = StackNavigationProp<AuthStack, 'Login'>

const LoginScreen = ({ navigation }: { navigation: LoginScreenNavigationProp }) => {
  const { values, handleSubmit, setFieldValue, handleChange } = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: (formValues) => {
      console.log('*** username: ', formValues.username)
      console.log('*** password: ', formValues.password)
    },
  })

  return (
    <SafeAreaView className="flex-1 p-5">
      <Text className="text-gray-800 text-2xl font-bold self-center ">
        {'Welcome to UConnectChat!'}
      </Text>
      <View className={'flex-1 items-center justify-center'}>
        <View className="bg-gray-200 p-5 rounded-md border border-gray-300">
          <Text className="text-gray-700 text-xl font-bold self-center mb-10">{'Sign in'}</Text>
          <View className={'w-80 border-gray-300'}>
            <UInputField
              labelTitle={'Username'}
              placeholder={'Enter username'}
              inputValue={values.username}
              onChangeText={handleChange('username')}
            />
            <UInputField
              labelTitle={'Password'}
              placeholder={'Enter password'}
              inputValue={values.password}
              onChangeText={handleChange('password')}
              secure
            />
            <Text className="text-gray-700 mb-10">
              {"Don't have an account? "}
              <Text
                className="underline text-blue-800"
                onPress={() => {
                  console.log('*** sign up screen')
                }}
              >
                {'Sign up here'}
              </Text>
            </Text>
            <UButton
              onButtonPress={() => {
                handleSubmit()
                navigation.getParent()?.navigate('App', { screen: 'Home' })
              }}
              buttonTitle="Login"
              variant="primary"
              disabled={values.password.length === 0 || values.username.length === 0}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default LoginScreen
