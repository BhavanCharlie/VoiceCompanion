import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Speech from 'expo-speech'
import { Vibration, Platform } from 'react-native'
import { Audio } from 'expo-av'

export type HapticPattern = 'success' | 'warning' | 'danger' | 'none'
export type VoiceMode = 'navigation' | 'art' | 'music' | 'error' | 'default'
export type SentimentTag = 'calm' | 'warm' | 'apologetic' | 'firm' | 'expressive'

interface VoiceModeContextType {
  isVoiceModeEnabled: boolean
  isWakeWordActive: boolean
  toggleVoiceMode: () => void
  speak: (text: string, mode?: VoiceMode, sentiment?: SentimentTag) => void
  stopSpeaking: () => void
  triggerHaptic: (pattern: HapticPattern) => void
  startWakeWordDetection: () => void
  stopWakeWordDetection: () => void
}

const VoiceModeContext = createContext<VoiceModeContextType | undefined>(undefined)

const STORAGE_KEY = '@voicecompanion:voice_mode_enabled'
const WAKE_WORD = 'hey companion'

// Haptic patterns
const HAPTIC_PATTERNS = {
  success: [100], // Short buzz
  warning: [100, 50, 100], // Double pulse
  danger: [100, 50, 100, 50, 100, 50, 100], // Continuous vibration
  none: [],
}

// Voice mode configurations
const VOICE_MODE_CONFIG = {
  navigation: {
    rate: 0.85, // Slightly faster
    pitch: 1.0,
    volume: 1.0,
    sentiment: 'calm' as SentimentTag,
  },
  art: {
    rate: 0.75, // Slower, more expressive
    pitch: 1.1, // Slightly higher
    volume: 1.0,
    sentiment: 'warm' as SentimentTag,
  },
  music: {
    rate: 0.7, // Slowest, most expressive
    pitch: 1.15,
    volume: 1.0,
    sentiment: 'expressive' as SentimentTag,
  },
  error: {
    rate: 0.8,
    pitch: 0.9, // Lower pitch
    volume: 1.0,
    sentiment: 'apologetic' as SentimentTag,
  },
  default: {
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    sentiment: 'warm' as SentimentTag,
  },
}

export const VoiceModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useState(false)
  const [isWakeWordActive, setIsWakeWordActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<Audio.Sound | null>(null)

  useEffect(() => {
    // Load saved preference
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        setIsVoiceModeEnabled(value === 'true')
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    // Initialize audio for spatial audio (future enhancement)
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    })
  }, [])

  const toggleVoiceMode = async () => {
    const newValue = !isVoiceModeEnabled
    setIsVoiceModeEnabled(newValue)
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newValue.toString())
      if (newValue) {
        speak('Voice mode enabled. Say "Hey Companion" to activate commands.', 'default', 'warm')
        startWakeWordDetection()
      } else {
        stopWakeWordDetection()
        speak('Voice mode disabled.', 'default', 'calm')
      }
    } catch (error) {
      console.error('Failed to save voice mode preference:', error)
    }
  }

  const speak = (
    text: string,
    mode: VoiceMode = 'default',
    sentiment?: SentimentTag
  ) => {
    if (!isVoiceModeEnabled && mode !== 'error') return

    const config = VOICE_MODE_CONFIG[mode]
    const finalSentiment = sentiment || config.sentiment

    // Adjust voice parameters based on sentiment
    let rate = config.rate
    let pitch = config.pitch

    switch (finalSentiment) {
      case 'apologetic':
        rate = 0.75
        pitch = 0.85
        break
      case 'firm':
        rate = 0.9
        pitch = 0.95
        break
      case 'expressive':
        rate = 0.7
        pitch = 1.2
        break
      case 'warm':
        rate = 0.8
        pitch = 1.1
        break
      case 'calm':
        rate = 0.85
        pitch = 1.0
        break
    }

    Speech.speak(text, {
      language: 'en',
      pitch,
      rate,
      volume: config.volume,
      quality: Speech.VoiceQuality.Enhanced,
    })
  }

  const stopSpeaking = () => {
    Speech.stop()
  }

  const triggerHaptic = (pattern: HapticPattern) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const patternArray = HAPTIC_PATTERNS[pattern]
      if (patternArray.length > 0) {
        Vibration.vibrate(patternArray)
      }
    }
  }

  const startWakeWordDetection = () => {
    if (!isVoiceModeEnabled) return

    // For React Native, we'll use a continuous listening approach
    // In production, you'd use a specialized wake word detection library
    // For now, we'll use Web Speech API pattern (will need @react-native-voice/voice for mobile)
    
    setIsWakeWordActive(true)
    
    // TODO: Implement actual wake word detection
    // This would require:
    // 1. Continuous audio capture
    // 2. Wake word model (e.g., Porcupine, Snowboy, or custom)
    // 3. Trigger command mode when wake word detected
    
    console.log('Wake word detection started. Listening for "Hey Companion"...')
  }

  const stopWakeWordDetection = () => {
    setIsWakeWordActive(false)
    if (recognitionRef.current) {
      // Stop any active recognition
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <VoiceModeContext.Provider
      value={{
        isVoiceModeEnabled,
        isWakeWordActive,
        toggleVoiceMode,
        speak,
        stopSpeaking,
        triggerHaptic,
        startWakeWordDetection,
        stopWakeWordDetection,
      }}
    >
      {children}
    </VoiceModeContext.Provider>
  )
}

export const useVoiceMode = (): VoiceModeContextType => {
  const context = useContext(VoiceModeContext)
  if (context === undefined) {
    throw new Error('useVoiceMode must be used within a VoiceModeProvider')
  }
  return context
}

