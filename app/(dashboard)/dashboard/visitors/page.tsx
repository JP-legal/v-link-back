import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VisitorCard } from '@/components/visitors/VisitorCard'
import { Visitor } from '@/lib/supabase/types'
import { Users, RotateCcw, UserCheck, TrendingUp } from 'lucide-react'

export default async function VisitorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  // Get visitors who have conversed with this profile
  const { data: conversations } = await supabase
    .from('conversations')
    .select('visitor_id, visitor_name, ai_summary, lead_captured')
    .eq('profile_id', profile.id)
    .not('visitor_id', 'is', null)
    .order('created_at', { ascending: false })

  const visitorIds = [...new Set(conversations?.map((c) => c.visitor_id).filter(Boolean))]

  const { data: visitors } = await supabase
    .from('visitors')
    .select('*')
    .in('id', visitorIds.slice(0, 100))
    .order('last_seen_at', { ascending: false })

  const { count: totalConvs } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profile.id)

  const identified = visitors?.filter((v) => v.name || v.email).length || 0
  const returning = visitors?.filter((v) => (v.total_conversations || 0) > 1).length || 0
  const leads = conversations?.filter((c) => c.lead_captured).length || 0

  const summaryByVisitor = (conversations || []).reduce<Record<string, string>>((acc, c) => {
    if (c.visitor_id && c.ai_summary && !acc[c.visitor_id]) {
      acc[c.visitor_id] = c.ai_summary
    }
    return acc
  }, {})

  const leadByVisitor = (conversations || []).reduce<Record<string, boolean>>((acc, c) => {
    if (c.visitor_id && c.lead_captured) acc[c.visitor_id] = true
    return acc
  }, {})

  const stats = [
    { label: 'Total Visitors', value: visitors?.length || 0, icon: Users },
    { label: 'Returning', value: returning, icon: RotateCcw },
    { label: 'Identified', value: identified, icon: UserCheck },
    { label: 'Leads', value: leads, icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Visitor Intelligence</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Visitor list */}
        <div className="space-y-2">
          {visitors?.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No visitors yet</p>
            </div>
          )}
          {visitors?.map((visitor) => (
            <VisitorCard
              key={visitor.id}
              visitor={visitor as Visitor}
              lastSummary={summaryByVisitor[visitor.id]}
              leadCaptured={leadByVisitor[visitor.id]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
