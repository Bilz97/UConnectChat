import * as React from 'react'
import { Text, View } from 'react-native'

import { type StackNavigationProp } from '@react-navigation/stack'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useFormik } from 'formik'
import Toast from 'react-native-toast-message'

import UButton from '../components/UButton'
import UInputField from '../components/UInputField'
import { type RootStack } from '../navigation/navigation'
import { storeUserData } from '../redux/actions/userActions'
import { loginUser } from '../redux/slices/userSlice'
import { useAppDispatch } from '../redux/store/hooks'
import { auth } from '../services/firebase'

type SignupFormNavigationProp = StackNavigationProp<RootStack, 'Auth'>

const SignupForm = ({
  navigation,
  setIsSignup,
}: {
  navigation: SignupFormNavigationProp
  setIsSignup: (value: boolean) => void
}) => {
  const [loading, setLoading] = React.useState(false)
  const dispatch = useAppDispatch()

  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async (formValues) => {
      // TODO add auth checks later
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formValues.email)) {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Invalid email address.',
        })
      } else if (formValues.password !== formValues.confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Password fields must match.',
        })
      } else {
        setLoading(true)
        await createUserWithEmailAndPassword(auth, formValues.email, formValues.password)
          .then(async (authUser) => {
            // Signed in
            const user = authUser.user
            const displayName = `${formValues.firstName} ${formValues.lastName}`
            if (user.email === null) {
              Toast.show({
                type: 'error',
                text1: 'Error!',
                text2: 'Something went wrong. Please try again',
              })
              return
            }
            await updateProfile(user, {
              displayName,
            })

            await dispatch(
              storeUserData({ email: user.email, uid: user.uid, displayName, photoUrl: '' })
            )

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
              text1: 'Sign up was successful!',
            })

            navigation.navigate('App', { screen: 'Home' })
          })
          .catch((error) => {
            const errorCode = error.code
            const errorMessage = error.message
            console.log(errorCode, errorMessage)
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
      <Text className="text-gray-700 text-xl font-bold self-center mb-5">{'Sign up'}</Text>
      <View className="w-full">
        <UInputField
          labelTitle={'First name'}
          placeholder={'Enter first name'}
          inputValue={values.firstName}
          onChangeText={handleChange('firstName')}
        />
        <UInputField
          labelTitle={'Last name'}
          placeholder={'Enter last name'}
          inputValue={values.lastName}
          onChangeText={handleChange('lastName')}
        />
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
        <UInputField
          labelTitle={'Confirm password'}
          placeholder={'Re-enter password'}
          inputValue={values.confirmPassword}
          onChangeText={handleChange('confirmPassword')}
          secure
        />
        <Text className="text-gray-700 mb-10">
          {'Already have an account? '}
          <Text
            className="underline text-blue-800"
            onPress={() => {
              setIsSignup(false)
            }}
          >
            {'Log in here'}
          </Text>
        </Text>
        <UButton
          onButtonPress={() => {
            handleSubmit()
          }}
          loading={loading}
          buttonTitle="Signup"
          variant="primary"
          disabled={values.password.length === 0 || values.email.length === 0}
        />
      </View>
    </View>
  )
}

export default SignupForm
