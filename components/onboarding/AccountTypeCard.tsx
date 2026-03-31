import { cn } from '@/lib/utils'
import { User, Building2 } from 'lucide-react'

interface AccountTypeCardProps {
  type: 'personal' | 'company'
  selected: boolean
  onSelect: () => void
}

const config = {
  personal: {
    icon: User,
    title: 'Personal',
    description: 'For individuals — freelancers, consultants, creators, professionals',
    features: ['AI that sounds like you', 'Voice cloning', 'Lead capture', 'Meeting booking'],
  },
  company: {
    icon: Building2,
    title: 'Company',
    description: 'For businesses — startups, agencies, service providers',
    features: ['Company AI identity', 'Team members', 'Multi-product showcase', 'CRM integrations'],
  },
}

export function AccountTypeCard({ type, selected, onSelect }: AccountTypeCardProps) {
  const { icon: Icon, title, description, features } = config[type]

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-5 rounded-2xl border-2 transition-all',
        selected
          ? 'border-indigo-600 bg-indigo-50/50'
          : 'border-gray-200 hover:border-indigo-300 bg-white'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
          )}
        >
          <Icon size={20} />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          <ul className="mt-3 space-y-1">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  )
}
