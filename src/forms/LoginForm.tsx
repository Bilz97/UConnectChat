import * as React from 'react'
import { Text, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'
import { useFormik } from 'formik'
import Toast from 'react-native-toast-message'

import UButton from '../components/UButton'
import UInputField from '../components/UInputField'
import { type RootStack } from '../navigation/navigation'

type LoginFormNavigationProp = StackNavigationProp<RootStack, 'Auth'>

const LoginForm = ({
  navigation,
  setIsSignup,
}: {
  navigation: LoginFormNavigationProp
  setIsSignup: (value: boolean) => void
}) => {
  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: (formValues) => {
      console.log('*** username: ', formValues.email)
      console.log('*** password: ', formValues.password)
      // TODO add auth checks later
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formValues.email)) {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Invalid email address',
        })
      } else {
        navigation.getParent()?.navigate('App', { screen: 'Home' })
      }
    },
  })

  return (
    <View className="bg-gray-200 p-5 rounded-md border border-gray-300">
      <Text className="text-gray-700 text-xl font-bold self-center mb-5">{'Sign in'}</Text>
      <View className={'w-80 border-gray-300'}>
        <UInputField
          labelTitle={'Email'}
          placeholder={'Enter email'}
          inputValue={values.email}
          onChangeText={handleChange('email')}
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
              setIsSignup(true)
            }}
          >
            {'Sign up here'}
          </Text>
        </Text>
        <UButton
          onButtonPress={() => {
            handleSubmit()
          }}
          buttonTitle="Login"
          variant="primary"
          disabled={values.password.length === 0 || values.email.length === 0}
        />
      </View>
    </View>
  )
}

export default LoginForm
