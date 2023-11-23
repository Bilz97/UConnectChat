import * as ImagePicker from 'expo-image-picker'
import { updateProfile } from 'firebase/auth'
import Toast from 'react-native-toast-message'

import { updateProfilePhoto } from '../redux/actions/userActions'
import { store } from '../redux/store/store'
import { auth } from '../services/firebase'

export async function imagePicker(uid: string) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 3],
    quality: 1,
  })

  if (!result.canceled && result.assets?.[0].type === 'image') {
    const photoUrl = result.assets[0].uri

    const user = auth.currentUser
    if (user !== null) {
      try {
        const response = await store.dispatch(updateProfilePhoto({ userUid: uid, photoUrl }))

        if (response.meta.requestStatus === 'fulfilled') {
          await updateProfile(user, {
            photoURL: photoUrl,
          })
          Toast.show({
            type: 'success',
            text1: 'Success!',
            text2: 'Your profile photo has been updated!',
          })
        }
      } catch {
        // do nothing
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Could not save profile photo. Please try again later.',
      })
    }
  }
}
