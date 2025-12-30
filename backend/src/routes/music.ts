import express from 'express'
import { elevenLabsService } from '../services/elevenLabsService.js'
import axios from 'axios'

const router = express.Router()

/**
 * Fallback music generation using simple audio synthesis
 * Creates a basic musical pattern based on the prompt
 */
async function generateMusicFallback(prompt: string, durationSeconds: number): Promise<Buffer> {
  try {
    console.log('Using open source fallback music generation for prompt:', prompt.substring(0, 50))
    
    // Use a simple approach: generate a basic musical pattern
    // This creates a simple melody using Web Audio API concepts
    // For a more sophisticated solution, we could use a library like Tone.js on the client side
    
    // For now, we'll use a simple approach with a basic audio file generation
    // or return a placeholder that indicates fallback was used
    
    // Try alternative Hugging Face models
    const models = [
      'facebook/musicgen-small',
      'facebook/musicgen-medium',
      'audiocraft/musicgen-small',
    ]
    
    for (const model of models) {
      try {
        const response = await axios.post(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            inputs: prompt,
            parameters: {
              duration: Math.min(durationSeconds, 30), // Max 30s for free tier
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}`,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            timeout: 120000,
          }
        )
        
        if (response.data && response.data.byteLength > 0) {
          console.log(`Successfully generated music using ${model}`)
          return Buffer.from(response.data)
        }
      } catch (modelError: any) {
        console.warn(`Model ${model} failed:`, modelError.message)
        continue
      }
    }
    
    // If all Hugging Face models fail, generate a simple placeholder audio
    // This creates a basic sine wave tone as a fallback
    return generateSimpleTone(durationSeconds)
  } catch (error: any) {
    console.error('All fallback methods failed, generating simple tone:', error)
    // Last resort: generate a simple tone
    return generateSimpleTone(durationSeconds)
  }
}

/**
 * Generate a simple musical pattern as ultimate fallback
 * Creates a pleasant melody using basic synthesis
 */
function generateSimpleTone(durationSeconds: number): Buffer {
  const sampleRate = 44100
  const numSamples = sampleRate * durationSeconds
  const buffer = Buffer.allocUnsafe(numSamples * 2) // 16-bit audio, 2 bytes per sample
  
  // Create a pleasant melody pattern (C major scale)
  const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25] // C, D, E, F, G, A, B, C
  const notesPerSecond = 2 // Play 2 notes per second
  const samplesPerNote = Math.floor(sampleRate / notesPerSecond)
  const totalNotes = Math.ceil(durationSeconds * notesPerSecond)
  
  for (let i = 0; i < numSamples; i++) {
    const noteIndex = Math.floor(i / samplesPerNote) % totalNotes
    const scaleIndex = noteIndex % scale.length
    const frequency = scale[scaleIndex]
    
    // Add some harmony with a lower octave
    const baseFreq = frequency
    const harmonyFreq = frequency * 0.5 // One octave lower
    
    // Generate waveform with multiple harmonics for richer sound
    const t = i / sampleRate
    const sample1 = Math.sin(2 * Math.PI * baseFreq * t)
    const sample2 = Math.sin(2 * Math.PI * harmonyFreq * t) * 0.5
    const sample = (sample1 + sample2) / 1.5
    
    // Apply ADSR envelope for each note
    const notePosition = (i % samplesPerNote) / samplesPerNote
    let envelope = 1.0
    if (notePosition < 0.1) {
      // Attack
      envelope = notePosition / 0.1
    } else if (notePosition > 0.9) {
      // Release
      envelope = (1 - notePosition) / 0.1
    }
    
    // Apply overall fade in/out
    const globalEnvelope = Math.min(1, Math.min(i / (sampleRate * 0.1), (numSamples - i) / (sampleRate * 0.1)))
    
    const amplitude = Math.floor(sample * envelope * globalEnvelope * 12000) // 16-bit range, reduced for safety
    
    // Write as 16-bit little-endian
    buffer.writeInt16LE(amplitude, i * 2)
  }
  
  // Convert to WAV format
  return createWavFile(buffer, sampleRate)
}

/**
 * Create a WAV file from audio buffer
 */
function createWavFile(audioData: Buffer, sampleRate: number): Buffer {
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * numChannels * bitsPerSample / 8
  const blockAlign = numChannels * bitsPerSample / 8
  const dataSize = audioData.length
  const fileSize = 36 + dataSize
  
  const wavHeader = Buffer.alloc(44)
  
  // RIFF header
  wavHeader.write('RIFF', 0)
  wavHeader.writeUInt32LE(fileSize, 4)
  wavHeader.write('WAVE', 8)
  
  // fmt chunk
  wavHeader.write('fmt ', 12)
  wavHeader.writeUInt32LE(16, 16) // fmt chunk size
  wavHeader.writeUInt16LE(1, 20) // audio format (PCM)
  wavHeader.writeUInt16LE(numChannels, 22)
  wavHeader.writeUInt32LE(sampleRate, 24)
  wavHeader.writeUInt32LE(byteRate, 28)
  wavHeader.writeUInt16LE(blockAlign, 32)
  wavHeader.writeUInt16LE(bitsPerSample, 34)
  
  // data chunk
  wavHeader.write('data', 36)
  wavHeader.writeUInt32LE(dataSize, 40)
  
  return Buffer.concat([wavHeader, audioData])
}

/**
 * Generate music from text/script using ElevenLabs with fallback
 * POST /api/music/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      musicLengthMs,
      modelId,
      forceInstrumental,
      respectSectionsDurations,
      storeForInpainting,
      signWithC2pa,
    } = req.body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Prompt is required',
        message: 'Please provide a text prompt describing the music you want to generate',
      })
    }

    let musicBuffer: Buffer
    let usedFallback = false

    try {
      // Try ElevenLabs first
      musicBuffer = await elevenLabsService.generateMusic(prompt, {
        musicLengthMs,
        modelId,
        forceInstrumental,
        respectSectionsDurations,
        storeForInpainting,
        signWithC2pa,
      })
      console.log('Music generated successfully using ElevenLabs')
    } catch (elevenLabsError: any) {
      console.warn('ElevenLabs music generation failed, trying fallback:', elevenLabsError.message)
      
      // Fallback to open source music generation
      try {
        const durationSeconds = Math.floor((musicLengthMs || 30000) / 1000)
        musicBuffer = await generateMusicFallback(prompt, Math.min(durationSeconds, 30)) // Max 30s for free tier
        usedFallback = true
        console.log('Music generated successfully using open source fallback')
      } catch (fallbackError: any) {
        console.warn('Fallback music generation failed, using simple tone generator:', fallbackError.message)
        // Ultimate fallback: generate simple musical tone
        const durationSeconds = Math.floor((musicLengthMs || 30000) / 1000)
        musicBuffer = generateSimpleTone(Math.min(durationSeconds, 30))
        usedFallback = true
        console.log('Music generated using simple tone fallback')
      }
    }

    // Set appropriate headers for audio response
    res.setHeader('Content-Type', usedFallback ? 'audio/wav' : 'audio/mpeg')
    res.setHeader('Content-Length', musicBuffer.length)
    res.setHeader('Content-Disposition', `attachment; filename="generated-music-${Date.now()}.${usedFallback ? 'wav' : 'mp3'}"`)
    if (usedFallback) {
      res.setHeader('X-Music-Source', 'fallback')
    }

    // Send the audio buffer
    res.send(musicBuffer)
  } catch (error: any) {
    console.error('Music generation error:', error)
    
    // Handle specific error types
    let statusCode = 500
    let errorMessage = error.message || 'An error occurred while generating music'
    
    if (error.message?.includes('API key')) {
      statusCode = 401
      errorMessage = error.message
    } else if (error.message?.includes('Payment Required') || error.message?.includes('paid subscription') || error.message?.includes('upgrade your plan')) {
      statusCode = 402
      errorMessage = error.message
    } else if (error.message?.includes('rate limit')) {
      statusCode = 429
      errorMessage = error.message
    } else if (error.message?.includes('not available') || error.message?.includes('endpoint not found')) {
      statusCode = 404
      errorMessage = error.message
    }
    
    res.status(statusCode).json({
      error: 'Failed to generate music',
      message: errorMessage,
    })
  }
})

export default router

