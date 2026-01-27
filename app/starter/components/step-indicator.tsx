import { BadgeCheck } from 'lucide-react'
import type { StepConfig, StarterStep } from '../types'
import { cn } from '~/lib/utils'

type StepIndicatorProps = {
  steps: StepConfig[]
  currentStep: StarterStep
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="hidden gap-3 text-sm font-medium text-muted-foreground sm:flex">
      {steps.map((step, idx) => {
        const isActive = step.id === currentStep
        const isDone = steps.findIndex((s) => s.id === currentStep) > idx
        return (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur',
              isActive && 'border-primary/60 bg-primary/20 text-primary-foreground',
              isDone && 'border-emerald-500/30 bg-emerald-500/15 text-emerald-100',
            )}
          >
            {isDone ? <BadgeCheck className="size-4" /> : <span className="text-xs">{idx + 1}</span>}
            <span>{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}
