import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsCards } from '@/components/dashboard/AnalyticsCards'
import { CreditMeter } from '@/components/dashboard/CreditMeter'
import Link from 'next/link'
import { MessageSquare, Users, TrendingUp, Settings, Share2, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/start')

  // Stats
  const [{ count: totalConvs }, { count: totalLeads }, { data: recentConvs }] = await Promise.all([
    supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id),
    supabase.from('conversations').select('id, visitor_name, ai_summary, created_at, mode, visitor_language').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(5),
  ])

  const { count: voiceConvs } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profile.id)
    .eq('mode', 'voice')

  const voicePercent = totalConvs ? Math.round(((voiceConvs || 0) / totalConvs) * 100) : 0

  const profileUrl = `/p/${profile.slug}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, {profile.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={profileUrl}
              target="_blank"
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50"
            >
              <ExternalLink size={14} />
              View profile
            </Link>
            <Link
              href="/dashboard/update"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700"
            >
              <Settings size={14} />
              Edit profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            <AnalyticsCards
              totalConversations={totalConvs || 0}
              totalVisitors={totalConvs || 0}
              leadsCount={totalLeads || 0}
              voicePercentage={voicePercent}
              avgDurationSeconds={0}
            />

            {/* Recent conversations */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Recent Conversations</h2>
                <Link href="/dashboard/conversations" className="text-sm text-indigo-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentConvs?.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No conversations yet. Share your profile link to get started!
                  </p>
                )}
                {recentConvs?.map((conv) => (
                  <div key={conv.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={14} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {conv.visitor_name || 'Anonymous'}
                      </p>
                      {conv.ai_summary && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{conv.ai_summary}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <CreditMeter credits={profile.credits} plan={profile.plan} />

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
              {[
                { href: '/dashboard/visitors', icon: Users, label: 'Visitors' },
                { href: '/dashboard/conversations', icon: MessageSquare, label: 'Conversations' },
                { href: '/dashboard/leads', icon: TrendingUp, label: 'Leads' },
                { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
                { href: '/dashboard/billing', icon: Settings, label: 'Billing' },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Icon size={14} className="text-gray-400" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Share */}
            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4">
              <p className="text-sm font-medium text-indigo-900 mb-1">Your AI link</p>
              <p className="text-xs text-indigo-600 font-mono break-all mb-3">
                {process.env.NEXT_PUBLIC_APP_URL}/p/{profile.slug}
              </p>
              <Link
                href={`/p/${profile.slug}`}
                target="_blank"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700"
              >
                <Share2 size={12} />
                Share profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
