'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LanguageSetup } from '@/components/onboarding/LanguageSetup'
import { createClient } from '@/lib/supabase/client'
import { Globe } from 'lucide-react'

export default function LanguageSetupPage() {
  const searchParams = useSearchParams()
  const profileId = searchParams.get('profileId') || ''
  const [settings, setSettings] = useState({
    defaultLanguage: '',
    languageMode: 'adaptive',
    arabicDialect: 'gulf',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      default_language: settings.defaultLanguage || 'en-US',
      language_mode: settings.languageMode,
      arabic_dialect: settings.arabicDialect,
    }).eq('id', profileId)

    router.push(`/preview?profileId=${profileId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your AI speaks the world&apos;s languages</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Configure how your AI handles different languages
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <LanguageSetup
            defaultLanguage={settings.defaultLanguage}
            languageMode={settings.languageMode}
            arabicDialect={settings.arabicDialect}
            onChange={setSettings}
          />

          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-6 w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
