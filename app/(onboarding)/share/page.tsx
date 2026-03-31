'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Copy, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function SharePage() {
  const searchParams = useSearchParams()
  const profileId = searchParams.get('profileId') || ''
  const [slug, setSlug] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('profiles').select('slug').eq('id', profileId).single().then(({ data }) => {
      if (data?.slug) setSlug(data.slug)
    })
  }, [profileId])

  const url = slug ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/p/${slug}` : ''

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900">Your AI is live!</h1>
        <p className="text-gray-500 mt-2 text-sm mb-8">
          Share this link and let your AI work for you 24/7
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <p className="flex-1 text-sm text-gray-700 font-mono truncate">{url}</p>
            <button
              onClick={copy}
              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/p/${slug}`}
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50"
            >
              <ExternalLink size={14} />
              Open profile
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
