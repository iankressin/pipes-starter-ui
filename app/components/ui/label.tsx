import * as React from 'react'

import { cn } from '~/lib/utils'

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<'label'> & {
    optional?: boolean
  }
>(({ className, optional, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  >
    <span className="inline-flex items-center gap-2">
      {children}
      {optional ? <span className="text-xs font-normal text-muted-foreground">(optional)</span> : null}
    </span>
  </label>
))
Label.displayName = 'Label'

export { Label }
