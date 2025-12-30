# Invisible Interface Implementation Guide

## Overview

This document outlines the implementation of the "Invisible Interface" UX strategy, creating a voice and haptic-driven experience that replaces traditional visual navigation.

## ✅ Completed Foundation

1. **VoiceModeContext** - Created for both mobile and web
   - Voice mode toggle
   - Context-aware tonality (navigation, art, music, error modes)
   - Haptic feedback patterns (success, warning, danger)
   - Wake word detection infrastructure

2. **Integration** - VoiceModeProvider added to both apps

## 🚧 Implementation Roadmap

### Phase 1: Core Voice Mode Features (Priority: High)

#### 1.1 Wake Word Integration
**Status**: Infrastructure ready, needs actual detection
**Location**: `VoiceModeContext.tsx`

**Implementation Steps**:
- [ ] For Mobile: Integrate `@react-native-voice/voice` or `react-native-porcupine` for wake word detection
- [ ] For Web: Enhance Web Speech API with continuous listening and wake word pattern matching
- [ ] Add floating microphone button that activates on wake word
- [ ] Test wake word "Hey Companion" detection accuracy

**Files to Modify**:
- `mobile/src/contexts/VoiceModeContext.tsx`
- `frontend/src/contexts/VoiceModeContext.tsx`

#### 1.2 Haptic Feedback Patterns
**Status**: Basic implementation done, needs integration
**Location**: `VoiceModeContext.tsx`

**Patterns**:
- ✅ Short Buzz (100ms): Success/Confirmation
- ✅ Double Pulse (100-50-100ms): Warning/Error
- ✅ Continuous Vibration: Danger/Obstacle proximity

**Next Steps**:
- [ ] Integrate haptic feedback in all feature screens
- [ ] Add haptic feedback for:
  - Image generation completion
  - Voice command recognition
  - Navigation warnings
  - Error states

**Files to Modify**:
- All screen components
- Feature components

#### 1.3 Dark Mode with High Contrast
**Status**: Not started
**Location**: New theme system

**Implementation**:
- [ ] Create theme context/provider
- [ ] Default dark mode with yellow/white high-contrast text
- [ ] Add theme toggle (voice-activated)
- [ ] Apply to all screens and components

**Files to Create**:
- `mobile/src/contexts/ThemeContext.tsx`
- `frontend/src/contexts/ThemeContext.tsx`
- `mobile/src/styles/darkTheme.ts`
- `frontend/src/styles/darkTheme.css`

### Phase 2: Enhanced Image to Voice (Priority: High)

#### 2.1 Conversational Scene Query
**Status**: Basic implementation exists, needs enhancement
**Location**: `ImageToVoiceScreen.tsx`, `ImageToVoice.tsx`

**Current**: Single static description
**Target**: Continuous conversation loop

**Implementation**:
- [ ] Add conversation history to image analysis
- [ ] Implement clock-face coordinate system for location descriptions
- [ ] Add follow-up question handling
- [ ] Update Gemini prompt with conversational context

**Example Flow**:
```
User: [Takes photo]
AI: "A messy desk"
User: "Where are my keys?"
AI: "They are at 2 o'clock, under the notebook"
```

**Files to Modify**:
- `backend/src/services/geminiService.ts` - Add conversational prompt
- `backend/src/routes/vision.ts` - Add conversation context
- `mobile/src/screens/ImageToVoiceScreen.tsx` - Add conversation UI
- `frontend/src/components/ImageToVoice.tsx` - Add conversation UI

**Backend Prompt Update**:
```typescript
const prompt = `You are a visual assistant helping a visually impaired user. 
Use clock-face coordinates (12 o'clock = top, 3 o'clock = right, etc.) for locations.
Be concise and conversational. If the user asks a follow-up question about the image, 
answer it using the same image context.`
```

### Phase 3: Real-Time Guidance Enhancement (Priority: High)

#### 3.1 Hybrid Reflex/Brain System
**Status**: Basic implementation exists, needs dual-layer architecture
**Location**: `BlindGuidanceScreen.tsx`, `RealTimeGuidance.tsx`

**Architecture**:
- **Layer 1 (Reflex)**: On-device obstacle detection (<100ms)
- **Layer 2 (Brain)**: Cloud AI processing (every 3 seconds)

**Implementation**:
- [ ] Integrate TensorFlow.js or MediaPipe for on-device detection
- [ ] Implement obstacle detection model
- [ ] Add immediate vibration trigger for objects <3ft away
- [ ] Separate cloud processing for environment description
- [ ] Optimize frame processing intervals

**Files to Create/Modify**:
- `mobile/src/services/obstacleDetection.ts` - On-device detection
- `mobile/src/screens/BlindGuidanceScreen.tsx` - Dual-layer integration
- `frontend/src/components/RealTimeGuidance.tsx` - Web implementation
- `backend/src/routes/guidance.ts` - Cloud processing endpoint

#### 3.2 Spatial Audio Beacons
**Status**: Not started
**Location**: New audio service

**Implementation**:
- [ ] Implement 3D spatial audio using Web Audio API (web) / Expo AV (mobile)
- [ ] Create audio beacon system (ticking sound for navigation)
- [ ] Position audio based on direction (left/right/center)
- [ ] Integrate with navigation guidance

**Files to Create**:
- `mobile/src/services/spatialAudio.ts`
- `frontend/src/services/spatialAudio.ts`

### Phase 4: Voice Guided Shopping Enhancement (Priority: Medium)

#### 4.1 Dietary Filter System
**Status**: Not started
**Location**: `VoiceGuidedShoppingScreen.tsx`, `VoiceGuidedShopping.tsx`

**Implementation**:
- [ ] Create user profile system (allergies, dietary restrictions)
- [ ] Integrate Open Food Facts API for barcode scanning
- [ ] Add ingredient checking logic
- [ ] Voice warnings for unsafe items
- [ ] Store user preferences

**Files to Create/Modify**:
- `backend/src/services/foodService.ts` - Food API integration
- `backend/src/routes/shopping.ts` - Dietary filter endpoint
- `mobile/src/screens/VoiceGuidedShoppingScreen.tsx` - Profile UI
- `frontend/src/components/VoiceGuidedShopping.tsx` - Profile UI
- `shared/src/types.ts` - User profile types

#### 4.2 Budget Tracker
**Status**: Not started
**Location**: Shopping components

**Implementation**:
- [ ] Add budget input (voice or text)
- [ ] Track scanned items and prices
- [ ] Calculate running total
- [ ] Voice announcements for budget status
- [ ] Warning when approaching budget limit

**Files to Modify**:
- `mobile/src/screens/VoiceGuidedShoppingScreen.tsx`
- `frontend/src/components/VoiceGuidedShopping.tsx`
- `backend/src/routes/shopping.ts` - Budget tracking

### Phase 5: Language Learning Enhancement (Priority: Medium)

#### 5.1 Roleplay Mode
**Status**: Not started
**Location**: `LearningModeScreen.tsx`

**Implementation**:
- [ ] Create persona system (e.g., "Impatient French Waiter")
- [ ] Integrate ElevenLabs with custom system prompts
- [ ] Add personality-based voice characteristics
- [ ] Create roleplay scenarios
- [ ] Add pressure/timer mechanics

**Files to Create/Modify**:
- `backend/src/services/personaService.ts` - Persona definitions
- `backend/src/routes/conversation.ts` - Persona integration
- `mobile/src/screens/LearningModeScreen.tsx` - Roleplay UI
- `frontend/src/components/VoiceConversation.tsx` - Roleplay UI

#### 5.2 Scavenger Hunt Mode
**Status**: Not started
**Location**: New component

**Implementation**:
- [ ] Create vocabulary word challenges
- [ ] Add photo validation using Gemini Vision
- [ ] Implement level progression
- [ ] Voice feedback on success/failure
- [ ] Track completion

**Files to Create**:
- `mobile/src/screens/ScavengerHuntScreen.tsx`
- `frontend/src/components/ScavengerHunt.tsx`
- `backend/src/routes/learning.ts` - Scavenger hunt endpoint

### Phase 6: Empathy Engine (Priority: Medium)

#### 6.1 Context-Aware Tonality
**Status**: Basic implementation in VoiceModeContext
**Location**: `VoiceModeContext.tsx`

**Current**: Mode-based tonality (navigation, art, music, error)
**Enhancement**: Sentiment-based adjustments

**Implementation**:
- [ ] Refine sentiment tags (calm, warm, apologetic, firm, expressive)
- [ ] Integrate with all voice outputs
- [ ] Add backend sentiment analysis
- [ ] Dynamic voice parameter adjustment

**Files to Modify**:
- `backend/src/services/textToSpeech.ts` - Add sentiment parameter
- `backend/src/routes/textToSpeech.ts` - Sentiment handling
- All components using voice output

## Technical Dependencies

### Mobile
- `@react-native-voice/voice` - Voice recognition
- `react-native-porcupine` (optional) - Wake word detection
- `@tensorflow/tfjs-react-native` - On-device ML
- `expo-av` - Spatial audio (already installed)

### Web
- Web Speech API (built-in)
- Web Audio API (built-in)
- TensorFlow.js - On-device ML

### Backend
- Open Food Facts API integration
- Enhanced Gemini prompts
- Sentiment analysis (optional: use Gemini)

## Testing Checklist

- [ ] Wake word detection accuracy (>90%)
- [ ] Haptic patterns trigger correctly
- [ ] Dark mode applies to all screens
- [ ] Conversational image queries work
- [ ] Obstacle detection <100ms response
- [ ] Spatial audio positioning accurate
- [ ] Dietary filters catch allergens
- [ ] Budget tracking accurate
- [ ] Roleplay personas sound natural
- [ ] Scavenger hunt validation works
- [ ] Voice tonality matches context

## Performance Targets

- Wake word detection: <500ms
- Obstacle detection (reflex): <100ms
- Cloud processing (brain): <3s
- Voice response: <2s
- Image analysis: <5s

## Accessibility Compliance

- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation
- High contrast mode
- Voice-only navigation path

## Next Steps

1. **Immediate**: Complete Phase 1 (Wake word, Haptics, Dark mode)
2. **Short-term**: Phase 2 (Conversational Image to Voice)
3. **Medium-term**: Phase 3 (Hybrid Guidance System)
4. **Long-term**: Phases 4-6 (Shopping, Learning, Empathy Engine)

## Notes

- All voice interactions should have haptic feedback
- Dark mode should be default for accessibility
- Wake word should work in background (mobile)
- All features should be voice-accessible
- Error states should use apologetic tone

