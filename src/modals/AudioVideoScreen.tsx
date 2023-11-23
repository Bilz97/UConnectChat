import * as React from 'react'
import {
  Button,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { type RouteProp } from '@react-navigation/native'
import { type StackNavigationProp } from '@react-navigation/stack'
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from 'react-native-twilio-video-webrtc'

import { type ModalStack } from '../navigation/navigation'

type ScreenRouteProp = RouteProp<ModalStack, 'AudioVideoModal'>
type ScreenNavigationProp = StackNavigationProp<ModalStack, 'AudioVideoModal'>

interface Props {
  navigation: ScreenNavigationProp
  route: ScreenRouteProp
}

const AudioVideoScreenModal = ({ navigation, route }: Props) => {
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true)
  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false)
  const [status, setStatus] = React.useState('disconnected')
  const [participants, setParticipants] = React.useState(new Map())
  const [videoTracks, setVideoTracks] = React.useState(new Map())
  const [token, setToken] = React.useState('')
  const twilioVideo = React.useRef(null)

  const _onConnectButtonPress = async () => {
    if (Platform.OS === 'android') {
      await _requestAudioPermission()
      await _requestCameraPermission()
    }
    twilioVideo.current.connect({
      accessToken: token,
      enableNetworkQualityReporting: true,
      dominantSpeakerEnabled: true,
    })
    setStatus('connecting')
  }

  const _onEndButtonPress = () => {
    twilioVideo.current.disconnect()
  }

  const _onMuteButtonPress = () => {
    twilioVideo.current.setLocalAudioEnabled(!isAudioEnabled).then((isEnabled) => {
      setIsAudioEnabled(isEnabled)
    })
  }

  const _onFlipButtonPress = () => {
    twilioVideo.current.flipCamera()
  }

  const _onRoomDidConnect = () => {
    setStatus('connected')
  }

  const _onRoomDidDisconnect = ({ error }) => {
    console.log('ERROR: ', error)

    setStatus('disconnected')
  }

  const _onRoomDidFailToConnect = (error) => {
    console.log('ERROR: ', error)

    setStatus('disconnected')
  }

  const _onParticipantAddedVideoTrack = ({ participant, track }) => {
    console.log('onParticipantAddedVideoTrack: ', participant, track)

    setVideoTracks((originalVideoTracks) => {
      originalVideoTracks.set(track.trackSid, {
        participantSid: participant.sid,
        videoTrackSid: track.trackSid,
      })
      return new Map(originalVideoTracks)
    })
  }

  const _onParticipantRemovedVideoTrack = ({ participant, track }) => {
    console.log('onParticipantRemovedVideoTrack: ', participant, track)

    setVideoTracks((originalVideoTracks) => {
      originalVideoTracks.delete(track.trackSid)
      return new Map(originalVideoTracks)
    })
  }

  const _onNetworkLevelChanged = ({ participant, isLocalUser, quality }) => {
    console.log('Participant', participant, 'isLocalUser', isLocalUser, 'quality', quality)
  }

  const _onDominantSpeakerDidChange = ({ roomName, roomSid, participant }) => {
    console.log(
      'onDominantSpeakerDidChange',
      `roomName: ${roomName}`,
      `roomSid: ${roomSid}`,
      'participant:',
      participant
    )
  }

  const _requestAudioPermission = async () => {
    return await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
      title: 'Need permission to access microphone',
      message: 'To run this demo we need permission to access your microphone',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    })
  }

  const _requestCameraPermission = async () => {
    return await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Need permission to access camera',
      message: 'To run this demo we need permission to access your camera',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    })
  }

  return (
    <View className="flex-1">
      {status === 'disconnected' && (
        <View>
          <Text style={styles.welcome}>React Native Twilio Video</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={token}
            onChangeText={(text) => {
              setToken(text)
            }}
          />
          <Button title="Connect" onPress={_onConnectButtonPress} />
        </View>
      )}

      {(status === 'connected' || status === 'connecting') && (
        <View className="flex-1 absolute left-0 right-0 top-0 bottom-0">
          {status === 'connected' && (
            <View style={styles.remoteGrid}>
              {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
                return (
                  <TwilioVideoParticipantView
                    style={styles.remoteVideo}
                    key={trackSid}
                    trackIdentifier={trackIdentifier}
                  />
                )
              })}
            </View>
          )}
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={_onEndButtonPress}>
              <Text style={{ fontSize: 12 }}>End</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={_onMuteButtonPress}>
              <Text style={{ fontSize: 12 }}>{isAudioEnabled ? 'Mute' : 'Unmute'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={_onFlipButtonPress}>
              <Text style={{ fontSize: 12 }}>Flip</Text>
            </TouchableOpacity>
            <TwilioVideoLocalView enabled={true} style={styles.localVideo} />
          </View>
        </View>
      )}

      <TwilioVideo
        ref={twilioVideo}
        onRoomDidConnect={_onRoomDidConnect}
        onRoomDidDisconnect={_onRoomDidDisconnect}
        onRoomDidFailToConnect={_onRoomDidFailToConnect}
        onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
        onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
        onNetworkQualityLevelsChanged={_onNetworkLevelChanged}
        onDominantSpeakerDidChange={_onDominantSpeakerDidChange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  callContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
  },
  welcome: {
    fontSize: 30,
    textAlign: 'center',
    paddingTop: 40,
  },
  input: {
    height: 50,
    borderWidth: 1,
    marginRight: 70,
    marginLeft: 70,
    marginTop: 50,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  button: {
    marginTop: 100,
  },
  localVideo: {
    flex: 1,
    width: 150,
    height: 250,
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  remoteGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  remoteVideo: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    width: 100,
    height: 120,
  },
  optionsContainer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    height: 100,
    backgroundColor: 'blue',
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionButton: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 100 / 2,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
export default AudioVideoScreenModal
