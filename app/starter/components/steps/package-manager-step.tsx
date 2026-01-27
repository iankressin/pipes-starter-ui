import { Check } from 'lucide-react'
import type { PackageManager, PackageManagerOption } from '../../types'
import { cn } from '~/lib/utils'

const packageManagers: PackageManagerOption[] = [
  {
    value: 'pnpm',
    name: 'pnpm',
    description: 'Fast, disk-efficient package manager',
  },
  {
    value: 'yarn',
    name: 'yarn',
    description: 'Stable, widely used package manager',
  },
  {
    value: 'npm',
    name: 'npm',
    description: 'Default Node.js package manager',
  },
  {
    value: 'bun',
    name: 'bun',
    description: 'Lightning fast, modern package manager',
  },
]

type PackageManagerStepProps = {
  selected?: PackageManager
  onSelect: (packageManager: PackageManager) => void
}

export function PackageManagerStep({ selected, onSelect }: PackageManagerStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Choose Package Manager</h2>
        <p className="text-sm text-muted-foreground mt-1">Select the package manager for your project</p>
      </div>

      <div className="grid gap-3">
        {packageManagers.map((pm) => (
          <button
            key={pm.value}
            type="button"
            onClick={() => onSelect(pm.value)}
            className={cn(
              'relative flex items-center gap-4 rounded-lg border p-4 text-left transition-all',
              'hover:border-primary/50 hover:bg-white/5',
              selected === pm.value
                ? 'border-primary bg-primary/10'
                : 'border-white/10 bg-black/20'
            )}
          >
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0',
                selected === pm.value ? 'border-primary bg-primary' : 'border-white/30'
              )}
            >
              {selected === pm.value && <Check className="h-3 w-3 text-white" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{pm.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{pm.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
