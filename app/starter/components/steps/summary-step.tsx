import { Button } from '~/components/ui/button'
import type { StarterStep, TemplateId, PackageManager } from '../../types'

type SummaryStepProps = {
  projectName: string
  packageManager: PackageManager
  networkName: string
  networkSlug: string
  templates: TemplateId[]
  templateNames: string
  sinkName: string
  onEdit: (step: StarterStep) => void
}

function SummaryRow({
  title,
  value,
  helper,
  onEdit,
}: {
  title: string
  value: string
  helper?: string
  onEdit?: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
        <div className="text-base font-medium text-white">{value || '—'}</div>
        {helper && <div className="text-xs text-muted-foreground">{helper}</div>}
      </div>
      {onEdit && (
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
      )}
    </div>
  )
}

export function SummaryStep({
  projectName,
  packageManager,
  networkName,
  networkSlug,
  templates,
  templateNames,
  sinkName,
  onEdit,
}: SummaryStepProps) {
  return (
    <section className="grid gap-4">
      <SummaryRow title="Project" value={projectName} helper="Folder name" onEdit={() => onEdit('project')} />
      <SummaryRow
        title="Package Manager"
        value={packageManager}
        helper="Dependency management"
        onEdit={() => onEdit('packageManager')}
      />
      <SummaryRow title="Network" value={networkName} helper={networkSlug} onEdit={() => onEdit('network')} />
      <SummaryRow
        title="Templates"
        value={`${templates.length} template(s)`}
        helper={templateNames}
        onEdit={() => onEdit('pipeline')}
      />
      <SummaryRow title="Storage" value={sinkName} helper="Data destination" onEdit={() => onEdit('sink')} />
    </section>
  )
}
