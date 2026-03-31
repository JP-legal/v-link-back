'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AccountTypeCard } from '@/components/onboarding/AccountTypeCard'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'

export default function StartPage() {
  const [accountType, setAccountType] = useState<'personal' | 'company'>('personal')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleNext() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    router.push(`/${accountType}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Choose your profile type</h1>
          <p className="text-gray-500 mt-2 text-sm">You can always change this later</p>
        </div>

        <div className="space-y-4">
          <AccountTypeCard
            type="personal"
            selected={accountType === 'personal'}
            onSelect={() => setAccountType('personal')}
          />
          <AccountTypeCard
            type="company"
            selected={accountType === 'company'}
            onSelect={() => setAccountType('company')}
          />
        </div>

        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
