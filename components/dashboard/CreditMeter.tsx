import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreditMeterProps {
  credits: number
  plan: string
  onTopUp?: () => void
}

const PLAN_LIMITS: Record<string, number> = {
  free: 500,
  personal: 5000,
  pro: 15000,
  elite: -1,
  startup: 20000,
  business: 80000,
  enterprise: -1,
}

export function CreditMeter({ credits, plan, onTopUp }: CreditMeterProps) {
  const limit = PLAN_LIMITS[plan] || 500
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 100 : Math.min(100, (credits / limit) * 100)
  const isLow = !isUnlimited && percentage < 15

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap size={14} className={cn(isLow ? 'text-red-500' : 'text-indigo-500')} />
          <span className="text-sm font-medium text-gray-700">Credits</span>
        </div>
        {onTopUp && (
          <button
            onClick={onTopUp}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Top up
          </button>
        )}
      </div>

      {isUnlimited ? (
        <p className="text-lg font-bold text-gray-900">Unlimited</p>
      ) : (
        <>
          <p className="text-lg font-bold text-gray-900">
            {credits.toLocaleString()}
            <span className="text-sm font-normal text-gray-400 ml-1">
              / {limit.toLocaleString()}
            </span>
          </p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isLow ? 'bg-red-500' : 'bg-indigo-500'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {isLow && (
            <p className="text-xs text-red-500 mt-1">Running low — top up to continue</p>
          )}
        </>
      )}
    </div>
  )
}
