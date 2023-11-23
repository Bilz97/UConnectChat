import * as React from 'react'
import { View } from 'react-native'

import { useFormik } from 'formik'

import UButton from '../components/UButton'
import UInputField from '../components/UInputField'
import { updateUserInfo } from '../redux/actions/userActions'
import { UserSelectors } from '../redux/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/hooks'

const PersonalInfoForm = () => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = React.useState(false)
  const profile = useAppSelector(UserSelectors.selectUser)

  if (profile == null) {
    return
  }
  const [firstName, lastName] = profile.displayName.split(' ')

  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      firstName,
      lastName,
      email: profile.email,
      aboutMe: profile.aboutMe,
    },
    onSubmit: async (values) => {
      setIsLoading(true)
      const displayName =
        values.firstName === firstName && values.lastName === lastName
          ? null
          : `${values.firstName.trim()} ${values.lastName.trim()}`

      const aboutMe = values.aboutMe === profile.aboutMe ? null : values.aboutMe.trim()

      await dispatch(updateUserInfo({ userUid: profile.uid, displayName, aboutMe }))
      setIsLoading(false)
    },
  })

  return (
    <View className="flex-1">
      <View className="w-full flex-1">
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
          placeholder={'Enter last name'}
          inputValue={values.email}
          onChangeText={handleChange('email')}
          editable={false}
        />
        <UInputField
          customInputClass={'h-40'}
          labelTitle={'About me'}
          placeholder={'Tell the world a bit about yourself...'}
          inputValue={values.aboutMe}
          onChangeText={handleChange('aboutMe')}
          multiLine
          lines={5}
          maxLength={300}
          showCharacterLimit
        />
        <View className="w-full absolute left-0 right-0 bottom-0">
          <UButton
            buttonTitle="Save"
            variant="primary"
            loading={isLoading}
            onButtonPress={handleSubmit}
            disabled={
              values.firstName?.trim() === firstName &&
              values.lastName?.trim() === lastName &&
              values.aboutMe?.trim() === profile.aboutMe
            }
          />
        </View>
      </View>
    </View>
  )
}

export default PersonalInfoForm
