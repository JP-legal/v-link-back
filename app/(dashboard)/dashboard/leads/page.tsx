import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Phone, ExternalLink } from 'lucide-react'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, calendly_url')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Leads</h1>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {leads?.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-sm">No leads yet. Share your profile to get started!</p>
            </div>
          )}
          {leads?.map((lead, i) => (
            <div
              key={lead.id}
              className={`flex items-center gap-4 px-6 py-4 ${i !== 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {lead.name ? lead.name[0] : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{lead.name || 'Anonymous'}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {lead.email && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail size={10} />
                      {lead.email}
                    </span>
                  )}
                  {lead.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={10} />
                      {lead.phone}
                    </span>
                  )}
                </div>
                {lead.message && (
                  <p className="text-xs text-gray-500 mt-1 italic truncate">"{lead.message}"</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                  lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                  lead.status === 'qualified' ? 'bg-indigo-100 text-indigo-700' :
                  lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {lead.status}
                </span>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </p>
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Mail size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
