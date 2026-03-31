'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ScrapeProgress } from '@/components/onboarding/ScrapeProgress'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, SkipForward } from 'lucide-react'

export default function EnrichPage() {
  const searchParams = useSearchParams()
  const profileId = searchParams.get('profileId')
  const [enriching, setEnriching] = useState(false)
  const [done, setDone] = useState(false)
  const [preview, setPreview] = useState<{ bio?: string; title?: string }>({})
  const router = useRouter()

  useEffect(() => {
    if (!profileId) { router.push('/start'); return }
    autoEnrich()
  }, [profileId])

  async function autoEnrich() {
    setEnriching(true)
    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, linkedin_url, website, company')
      .eq('id', profileId)
      .single()

    if (!profile) { router.push('/start'); return }

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          linkedinUrl: profile.linkedin_url,
          websiteUrl: profile.website,
          company: profile.company,
          profileId,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setPreview({ bio: data.data.bio, title: data.data.title })
      }
    } catch {}

    setEnriching(false)
    setDone(true)
  }

  function handleNext() {
    router.push(`/voice-setup?profileId=${profileId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Building your AI persona</h1>
          <p className="text-gray-500 mt-2 text-sm">
            We&apos;re scanning the web to build the smartest possible AI version of you
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <ScrapeProgress isLoading={enriching} />

          {done && (
            <div className="mt-6 space-y-4">
              {preview.bio && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Generated bio
                  </p>
                  <p className="text-sm text-gray-700">{preview.bio}</p>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
              >
                Looks good — continue
              </button>
            </div>
          )}

          {!done && !enriching && (
            <button
              onClick={handleNext}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-gray-500 hover:text-gray-700 text-sm"
            >
              <SkipForward size={16} />
              Skip enrichment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
