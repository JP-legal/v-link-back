'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/supabase/types'
import { LanguageSetup } from '@/components/onboarding/LanguageSetup'
import { Save } from 'lucide-react'

export default function UpdateProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
        if (data) setProfile(data)
      })
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      name: profile.name,
      title: profile.title,
      company: profile.company,
      bio: profile.bio,
      website: profile.website,
      linkedin_url: profile.linkedin_url,
      calendly_url: profile.calendly_url,
      whatsapp_number: profile.whatsapp_number,
      notification_email: profile.notification_email,
      ai_tone: profile.ai_tone,
      ai_context: profile.ai_context,
      default_language: profile.default_language,
      language_mode: profile.language_mode,
      arabic_dialect: profile.arabic_dialect,
    }).eq('id', profile.id!)

    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 2000)
  }

  function set(key: keyof Profile, value: unknown) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'title', label: 'Title / Role', type: 'text' },
    { key: 'company', label: 'Company', type: 'text' },
    { key: 'website', label: 'Website URL', type: 'url' },
    { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
    { key: 'calendly_url', label: 'Calendly URL', type: 'url' },
    { key: 'whatsapp_number', label: 'WhatsApp Number (for lead alerts)', type: 'tel' },
    { key: 'notification_email', label: 'Notification Email', type: 'email' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Info</h2>
            {fields.map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={(profile[key] as string) || ''}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => set('bio', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">AI Tone</label>
              <select
                value={profile.ai_tone || 'professional'}
                onChange={(e) => set('ai_tone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly & Casual</option>
                <option value="formal">Formal</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="warm">Warm & Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Additional AI Context
              </label>
              <textarea
                value={profile.ai_context || ''}
                onChange={(e) => set('ai_context', e.target.value)}
                rows={3}
                placeholder="Any specific info your AI should know: pricing, availability, key services..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Language Settings</h2>
            <LanguageSetup
              defaultLanguage={profile.default_language || ''}
              languageMode={profile.language_mode || 'adaptive'}
              arabicDialect={profile.arabic_dialect || 'gulf'}
              onChange={(vals) => {
                set('default_language', vals.defaultLanguage)
                set('language_mode', vals.languageMode)
                set('arabic_dialect', vals.arabicDialect)
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {saved ? 'Saved!' : loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
