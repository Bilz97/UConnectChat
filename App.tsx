import * as React from 'react'
import { ActivityIndicator } from 'react-native'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import AppContainer from './AppContainer'
import { persistor, store } from './src/redux/store/store'

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size={'small'} />} persistor={persistor}>
        <AppContainer />
      </PersistGate>
    </Provider>
  )
}
