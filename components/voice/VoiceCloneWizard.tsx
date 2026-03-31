'use client'

import { useState, useRef } from 'react'
import { Mic, Square, Play, RotateCcw, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PROMPTS = [
  "Hello! Welcome to my profile. I'm excited to tell you about my work and how we might collaborate together. My background spans across many interesting projects and I love connecting with new people.",
  "In my career I've focused on delivering real results for clients. The things I'm most passionate about are innovation, quality, and building meaningful professional relationships that last.",
  "If you have any questions or want to explore working together, I'm always open to a conversation. Don't hesitate to reach out — I look forward to hearing from you.",
]

interface VoiceCloneWizardProps {
  profileId: string
  profileName: string
  onComplete: (voiceId: string) => void
  onSkip: () => void
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'uploading' | 'done'

export function VoiceCloneWizard({ profileId, profileName, onComplete, onSkip }: VoiceCloneWizardProps) {
  const [step, setStep] = useState(0) // 0,1,2 = recording prompts; 3 = cloning
  const [recordings, setRecordings] = useState<Blob[]>([])
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function startRecording() {
    setError('')
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      setPreviewUrl(URL.createObjectURL(blob))
      setRecordingState('recorded')
    }
    recorder.start()
    mediaRecorderRef.current = recorder
    setRecordingState('recording')
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
  }

  function reRecord() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(undefined)
    setRecordingState('idle')
  }

  function acceptRecording() {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    setRecordings((prev) => {
      const next = [...prev]
      next[step] = blob
      return next
    })
    if (step < 2) {
      setStep((s) => s + 1)
      setRecordingState('idle')
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(undefined)
    } else {
      cloneVoice([...recordings.slice(0, step), blob])
    }
  }

  async function cloneVoice(blobs: Blob[]) {
    setRecordingState('uploading')
    const formData = new FormData()
    formData.append('profileId', profileId)
    formData.append('profileName', profileName)
    blobs.forEach((b) => formData.append('audio', b, 'sample.webm'))

    const res = await fetch('/api/voice/clone', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Voice cloning failed')
      setRecordingState('recorded')
      return
    }

    setRecordingState('done')
    onComplete(data.voice_id)
  }

  if (recordingState === 'uploading' || recordingState === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
          {recordingState === 'done' ? (
            <Check className="w-8 h-8 text-indigo-600" />
          ) : (
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          )}
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">
            {recordingState === 'done' ? 'Voice cloned!' : 'Cloning your voice...'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {recordingState === 'done'
              ? 'Your AI will now sound like you.'
              : 'This usually takes under 30 seconds.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < step ? 'bg-indigo-600' : i === step ? 'bg-indigo-300' : 'bg-gray-200'
            )}
          />
        ))}
      </div>

      <div>
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
          Sample {step + 1} of 3
        </p>
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 italic">
          "{PROMPTS[step]}"
        </p>
      </div>

      {/* Recording controls */}
      <div className="flex flex-col items-center gap-4">
        {recordingState === 'idle' && (
          <button
            onClick={startRecording}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
          >
            <Mic size={24} />
          </button>
        )}

        {recordingState === 'recording' && (
          <button
            onClick={stopRecording}
            className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse"
          >
            <Square size={20} />
          </button>
        )}

        {recordingState === 'recorded' && previewUrl && (
          <div className="w-full space-y-4">
            <audio src={previewUrl} controls className="w-full" />
            <div className="flex gap-3">
              <button
                onClick={reRecord}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw size={14} />
                Re-record
              </button>
              <button
                onClick={acceptRecording}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700"
              >
                <Check size={14} />
                {step < 2 ? 'Next prompt' : 'Clone voice'}
              </button>
            </div>
          </div>
        )}

        {recordingState === 'idle' && (
          <p className="text-xs text-gray-400">Tap the mic and read the prompt naturally</p>
        )}
        {recordingState === 'recording' && (
          <p className="text-xs text-red-500 animate-pulse">Recording... tap to stop</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <button
        onClick={onSkip}
        className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
      >
        Skip — use text only
      </button>
    </div>
  )
}
