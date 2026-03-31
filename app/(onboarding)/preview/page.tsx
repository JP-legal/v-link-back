'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/supabase/types'
import { Eye, Share2 } from 'lucide-react'
import Link from 'next/link'

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const profileId = searchParams.get('profileId') || ''
  const [profile, setProfile] = useState<Profile | null>(null)
  const [publishing, setPublishing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!profileId) return
    const supabase = createClient()
    supabase.from('profiles').select('*').eq('id', profileId).single().then(({ data }) => {
      setProfile(data)
    })
  }, [profileId])

  async function publish() {
    setPublishing(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ is_published: true }).eq('id', profileId)
    router.push(`/share?profileId=${profileId}`)
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${profile.slug}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your AI is ready</h1>
          <p className="text-gray-500 mt-2 text-sm">Preview before publishing</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* Profile summary */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {profile.name[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{profile.name}</p>
              {profile.title && <p className="text-gray-500 text-sm">{profile.title}</p>}
              {profile.company && <p className="text-gray-400 text-sm">{profile.company}</p>}
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
              {profile.language_mode} language mode
            </span>
            {profile.voice_enabled && (
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">
                Voice enabled
              </span>
            )}
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              aura.ai/p/{profile.slug}
            </span>
          </div>

          <div className="space-y-3">
            <Link
              href={`/p/${profile.slug}`}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-indigo-200 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors text-sm"
            >
              <Eye size={16} />
              Preview your profile
            </Link>

            <button
              onClick={publish}
              disabled={publishing}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
            >
              <Share2 size={16} />
              {publishing ? 'Publishing...' : 'Publish & Share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
