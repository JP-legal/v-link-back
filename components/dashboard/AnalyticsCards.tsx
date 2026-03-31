import { MessageSquare, Users, Mic, TrendingUp } from 'lucide-react'

interface AnalyticsCardsProps {
  totalConversations: number
  totalVisitors: number
  leadsCount: number
  voicePercentage: number
  avgDurationSeconds: number
}

export function AnalyticsCards({
  totalConversations,
  totalVisitors,
  leadsCount,
  voicePercentage,
  avgDurationSeconds,
}: AnalyticsCardsProps) {
  const avgMin = Math.floor(avgDurationSeconds / 60)
  const avgSec = avgDurationSeconds % 60

  const cards = [
    {
      label: 'Total Conversations',
      value: totalConversations.toLocaleString(),
      icon: MessageSquare,
      color: 'indigo',
    },
    {
      label: 'Unique Visitors',
      value: totalVisitors.toLocaleString(),
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Leads Captured',
      value: leadsCount.toLocaleString(),
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Voice Mode',
      value: `${voicePercentage}%`,
      icon: Mic,
      color: 'purple',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const colorMap: Record<string, string> = {
          indigo: 'bg-indigo-50 text-indigo-600',
          blue: 'bg-blue-50 text-blue-600',
          green: 'bg-green-50 text-green-600',
          purple: 'bg-purple-50 text-purple-600',
        }
        return (
          <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
