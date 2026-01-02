import * as React from 'react'

import { cn } from '~/lib/utils'

const badgeVariants = {
  default: 'bg-primary text-primary-foreground shadow-xs',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border bg-background/60 text-foreground',
  muted: 'bg-muted text-muted-foreground',
}

type BadgeVariant = keyof typeof badgeVariants

function Badge({ className, variant = 'default', ...props }: React.ComponentProps<'span'> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-tight',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge, type BadgeVariant }
