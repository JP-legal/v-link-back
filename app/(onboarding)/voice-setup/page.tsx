'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { VoiceCloneWizard } from '@/components/voice/VoiceCloneWizard'
import { Mic2, Library, SkipForward } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_VOICES } from '@/lib/supabase/types'

type Mode = 'choose' | 'clone' | 'library'

export default function VoiceSetupPage() {
  const searchParams = useSearchParams()
  const profileId = searchParams.get('profileId') || ''
  const [mode, setMode] = useState<Mode>('choose')
  const [profileName, setProfileName] = useState('')
  const router = useRouter()

  async function loadProfileName() {
    if (profileName) return
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('name').eq('id', profileId).single()
    if (data?.name) setProfileName(data.name)
  }

  async function handleLibraryVoice(voiceId: string) {
    const supabase = createClient()
    await supabase.from('voice_profiles').upsert(
      {
        profile_id: profileId,
        fallback_voice_id: voiceId,
        is_cloned: false,
      },
      { onConflict: 'profile_id' }
    )
    await supabase.from('profiles').update({ voice_enabled: true }).eq('id', profileId)
    router.push(`/language-setup?profileId=${profileId}`)
  }

  async function handleSkip() {
    router.push(`/language-setup?profileId=${profileId}`)
  }

  if (mode === 'clone') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Clone your voice</h1>
            <p className="text-gray-500 mt-2 text-sm">Read 3 prompts naturally (~30 sec each)</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <VoiceCloneWizard
              profileId={profileId}
              profileName={profileName}
              onComplete={() => router.push(`/language-setup?profileId=${profileId}`)}
              onSkip={handleSkip}
            />
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'library') {
    const voices = [
      { id: DEFAULT_VOICES.male_professional, label: 'Professional Male (Adam)', gender: 'male' },
      { id: DEFAULT_VOICES.female_professional, label: 'Professional Female (Bella)', gender: 'female' },
      { id: DEFAULT_VOICES.male_warm, label: 'Warm Male (Arnold)', gender: 'male' },
      { id: DEFAULT_VOICES.female_warm, label: 'Warm Female (Dorothy)', gender: 'female' },
    ]

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Choose an AI voice</h1>
            <p className="text-gray-500 mt-2 text-sm">Pick a professional voice for your AI</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
            {voices.map((v) => (
              <button
                key={v.id}
                onClick={() => handleLibraryVoice(v.id)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left"
              >
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mic2 size={16} className="text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-800">{v.label}</span>
              </button>
            ))}
            <button onClick={handleSkip} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 flex items-center justify-center gap-1">
              <SkipForward size={14} /> Skip — text only
            </button>
          </div>
        </div>
      </div>
    )
  }

  // mode === 'choose'
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Give your AI a voice</h1>
          <p className="text-gray-500 mt-2 text-sm">
            This step is optional — your AI can also work in text-only mode
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { loadProfileName(); setMode('clone') }}
            className="w-full p-5 bg-white rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 text-left transition-all shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mic2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Clone My Voice</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Record 3 samples — your AI will sound exactly like you
                </p>
                <span className="mt-2 inline-block text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  Recommended · Pro plan+
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('library')}
            className="w-full p-5 bg-white rounded-2xl border-2 border-gray-200 hover:border-indigo-300 text-left transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Library className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Choose AI Voice</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Pick from our professional voice library
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1"
          >
            <SkipForward size={14} />
            Skip — text only mode
          </button>
        </div>
      </div>
    </div>
  )
}
