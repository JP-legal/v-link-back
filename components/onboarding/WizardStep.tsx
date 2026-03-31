import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  id: string
  label: string
}

interface WizardStepProps {
  steps: Step[]
  currentStep: string
}

export function WizardStep({ steps, currentStep }: WizardStepProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex
        const isCurrent = step.id === currentStep

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  isCompleted && 'bg-indigo-600 text-white',
                  isCurrent && 'bg-indigo-600 text-white ring-4 ring-indigo-100',
                  !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400'
                )}
              >
                {isCompleted ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs hidden sm:block',
                  isCurrent ? 'text-indigo-600 font-medium' : 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 sm:w-16 mx-1 transition-colors',
                  i < currentIndex ? 'bg-indigo-600' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
