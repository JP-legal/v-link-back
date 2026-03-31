'use client'

import { useEffect, useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  'Scanning your LinkedIn...',
  'Reading your website...',
  'Finding public info...',
  'Building your AI persona...',
  'Almost done...',
]

interface ScrapeProgressProps {
  isLoading: boolean
}

export function ScrapeProgress({ isLoading }: ScrapeProgressProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) return
    setStepIndex(0)
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
    }, 1800)
    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="space-y-3">
      {STEPS.slice(0, stepIndex + 1).map((step, i) => (
        <div key={i} className={cn('flex items-center gap-2.5 text-sm transition-all')}>
          {i < stepIndex ? (
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check size={12} className="text-green-600" />
            </div>
          ) : (
            <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Loader2 size={12} className="text-indigo-600 animate-spin" />
            </div>
          )}
          <span className={cn(i < stepIndex ? 'text-gray-400' : 'text-gray-700')}>{step}</span>
        </div>
      ))}
    </div>
  )
}
