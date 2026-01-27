import { BadgeCheck, Terminal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import type { NetworkType, PackageManager, TemplateId, TemplateParamsState } from '../types'

type SidePanelProps = {
  projectName: string
  packageManager?: PackageManager
  networkType?: NetworkType
  selectedNetwork?: string
  selectedTemplates: TemplateId[]
  templateParams: TemplateParamsState
  selectedSink?: string
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-white truncate ml-2">{value}</span>
    </div>
  )
}

function getTemplatesSummary(templates: TemplateId[]): string {
  if (templates.length === 0) return ''
  return `${templates.length} templates`
}

export function SidePanel({
  projectName,
  packageManager,
  networkType,
  selectedNetwork,
  selectedTemplates,
  templateParams,
  selectedSink,
}: SidePanelProps) {
  const templatesSummary = getTemplatesSummary(selectedTemplates)

  return (
    <div className="space-y-4">
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white font-thin">Summary</CardTitle>
          <CardDescription className="text-muted-foreground">
            Track your picks before generating the command.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <SummaryItem label="Project" value={projectName || '—'} />
          <SummaryItem label="Package Mgr" value={packageManager || '—'} />
          <SummaryItem label="Chain" value={networkType ? networkType.toUpperCase() : '—'} />
          <SummaryItem label="Network" value={selectedNetwork || '—'} />
          <SummaryItem label="Templates" value={templatesSummary || '—'} />
          <SummaryItem label="Sink" value={selectedSink || '—'} />
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-gradient-to-br from-purple-600/30 via-transparent to-blue-600/20 text-white shadow-xl shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="size-5" />
            Next steps
          </CardTitle>
          <CardDescription className="text-white/70">
            Copy and run the command to scaffold your project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 size-5 text-emerald-300 flex-shrink-0" />
            <div>
              <div className="font-medium">Run the command</div>
              <div className="text-white/70">
                Copy the command from the final step and run it in your terminal. This scaffolds a ready-to-run Pipes
                SDK project.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 size-5 text-emerald-300 flex-shrink-0" />
            <div>
              <div className="font-medium">Start building</div>
              <div className="text-white/70">Open the generated folder, tweak mappings, and go live.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
