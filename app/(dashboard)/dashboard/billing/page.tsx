import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreditMeter } from '@/components/dashboard/CreditMeter'
import { Check } from 'lucide-react'

const PLANS = [
  { id: 'personal', name: 'Personal', price: '$9/mo', credits: '5,000', highlight: false },
  { id: 'pro', name: 'Pro', price: '$19/mo', credits: '15,000', highlight: true, badge: 'Popular' },
  { id: 'elite', name: 'Elite', price: '$39/mo', credits: 'Unlimited', highlight: false },
  { id: 'startup', name: 'Startup', price: '$29/mo', credits: '20,000', highlight: false },
  { id: 'business', name: 'Business', price: '$79/mo', credits: '80,000', highlight: false },
  { id: 'enterprise', name: 'Enterprise', price: '$199/mo', credits: 'Unlimited', highlight: false },
]

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, credits, plan, name')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Billing & Credits</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <CreditMeter credits={profile.credits} plan={profile.plan} />
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Credit rates</p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between"><span>Text message</span><span>1 credit</span></div>
                <div className="flex justify-between"><span>Voice playback</span><span>3 credits</span></div>
                <div className="flex justify-between"><span>Voice mode (per min)</span><span>8 credits</span></div>
                <div className="flex justify-between"><span>Voice cloning (one-time)</span><span>50 credits</span></div>
              </div>
              <p className="text-xs text-gray-400 mt-3">1 credit ≈ $0.002</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Current plan: <span className="capitalize font-bold text-indigo-600">{profile.plan}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-4 rounded-2xl border-2 ${
                    profile.plan === plan.id
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : plan.highlight
                      ? 'border-indigo-300 bg-white'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2 left-4 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                  {profile.plan === plan.id && (
                    <span className="absolute -top-2 right-4 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                  <p className="font-semibold text-gray-900">{plan.name}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">{plan.price}</p>
                  <p className="text-xs text-gray-500">{plan.credits} credits/mo</p>
                  {profile.plan !== plan.id && (
                    <form action="/api/billing/checkout" method="POST">
                      <input type="hidden" name="plan" value={plan.id} />
                      <button
                        type="submit"
                        className="mt-3 w-full py-2 text-xs font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                      >
                        Upgrade
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
