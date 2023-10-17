import * as React from 'react'
import { Text, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useFormik } from 'formik'
import Toast from 'react-native-toast-message'

import UButton from '../components/UButton'
import UInputField from '../components/UInputField'
import { type RootStack } from '../navigation/navigation'
import { loginUser } from '../redux/slices/userSlice'
import { useAppDispatch } from '../redux/store/hooks'
import { getAuth } from '../services/firebase'

type LoginFormNavigationProp = StackNavigationProp<RootStack, 'Auth'>

const LoginForm = ({
  navigation,
  setIsSignup,
}: {
  navigation: LoginFormNavigationProp
  setIsSignup: (value: boolean) => void
}) => {
  const [loading, setLoading] = React.useState(false)
  const dispatch = useAppDispatch()

  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async (formValues) => {
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
        setLoading(true)
        await signInWithEmailAndPassword(getAuth(), formValues.email, formValues.password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user

            console.log(user)
            dispatch(
              loginUser({
                email: user.email,
                uid: user.uid,
                displayName: user?.displayName ?? null,
                photoUrl: user?.photoURL ?? null,
              })
            )
            Toast.show({
              type: 'success',
              text1: 'Login successful!',
            })
            navigation.navigate('App', { screen: 'Home' })
          })
          .catch((error) => {
            const errorMessage = error.message

            Toast.show({
              type: 'error',
              text1: 'Error!',
              text2: errorMessage,
            })
          })
        setLoading(false)
      }
    },
  })

  return (
    <View className="bg-gray-200 p-5 rounded-md border border-gray-300 w-full items-center">
      <Text className="text-gray-700 text-xl font-bold self-center mb-5">{'Sign in'}</Text>
      <View className={'w-full'}>
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
          loading={loading}
        />
      </View>
    </View>
  )
}

export default LoginForm
