import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SUPPORTED_LANGUAGES } from '@/lib/supabase/types'
import { AnalyticsCards } from '@/components/dashboard/AnalyticsCards'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  const { data: convs } = await supabase
    .from('conversations')
    .select('mode, visitor_language, duration_seconds, lead_captured, topics, created_at')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })

  const total = convs?.length || 0
  const voiceCount = convs?.filter((c) => c.mode === 'voice').length || 0
  const voicePercent = total ? Math.round((voiceCount / total) * 100) : 0
  const leads = convs?.filter((c) => c.lead_captured).length || 0

  const avgDuration = total
    ? Math.round((convs?.reduce((s, c) => s + (c.duration_seconds || 0), 0) || 0) / total)
    : 0

  // Language breakdown
  const langCounts: Record<string, number> = {}
  convs?.forEach((c) => {
    const lang = c.visitor_language || 'en-US'
    langCounts[lang] = (langCounts[lang] || 0) + 1
  })
  const langBreakdown = Object.entries(langCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  // Topic counts
  const topicCounts: Record<string, number> = {}
  convs?.forEach((c) => {
    (c.topics || []).forEach((topic: string) => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1
    })
  })
  const topTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const uniqueVisitors = new Set(convs?.map((c) => c.visitor_language)).size

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

        <div className="space-y-6">
          <AnalyticsCards
            totalConversations={total}
            totalVisitors={uniqueVisitors}
            leadsCount={leads}
            voicePercentage={voicePercent}
            avgDurationSeconds={avgDuration}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Language breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Language Breakdown</h2>
              <div className="space-y-3">
                {langBreakdown.length === 0 && (
                  <p className="text-sm text-gray-400">No data yet</p>
                )}
                {langBreakdown.map(([lang, count]) => {
                  const info = SUPPORTED_LANGUAGES[lang]
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={lang}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">
                          {info?.flag} {info?.name || lang}
                        </span>
                        <span className="text-gray-400">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Voice vs Text */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Voice vs Text</h2>
              <div className="space-y-3">
                {[
                  { label: 'Voice Mode', count: voiceCount, color: 'bg-purple-500' },
                  { label: 'Chat Mode', count: total - voiceCount, color: 'bg-indigo-500' },
                ].map(({ label, count, color }) => {
                  const pct = total ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{label}</span>
                        <span className="text-gray-400">{pct}% ({count})</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Top topics */}
              {topTopics.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 text-sm mb-3">Top Topics</h3>
                  <ol className="space-y-2">
                    {topTopics.map(([topic, count], i) => (
                      <li key={topic} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-300 font-mono text-xs">{i + 1}.</span>
                        <span className="text-gray-700 truncate flex-1">{topic}</span>
                        <span className="text-gray-400 text-xs">{count}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
