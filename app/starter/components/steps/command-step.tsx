import { useState } from 'react'
import { Download, Terminal } from 'lucide-react'
import { Code } from '~/components/ui/code'
import { Button } from '~/components/ui/button'
import type { PipesConfig } from '../../types'

type CommandStepProps = {
  command: string
  config: PipesConfig
  configHash?: string | null
}

export function CommandStep({ command, config, configHash }: CommandStepProps) {
  const [showFull, setShowFull] = useState(false)

  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pipes-starter.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const shortCommand = configHash
    ? `npx -y @iankressin/pipes-cli@latest init --config-id ${configHash}`
    : command

  const displayCommand = showFull || !configHash ? command : shortCommand

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <Terminal className="size-5" />
          <span className="text-sm font-medium">Ready to initialize</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Copy the command below and run it in your terminal to create your Pipes SDK project with your chosen
          configuration.
        </p>
      </div>

      {configHash && (
        <div className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-purple-200">
              {showFull ? 'Full command with inline config' : 'Short command using config ID'}
            </p>
            <p className="text-xs text-purple-300/70 mt-0.5">
              {showFull
                ? 'The full JSON is embedded in the command'
                : `Use the config ID for convenience`}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowFull(!showFull)}>
            {showFull ? 'Show Short' : 'Show Full'}
          </Button>
        </div>
      )}

      <div className="relative">
        <Code language="bash">{displayCommand}</Code>
      </div>

      <Button variant="outline" size="sm" onClick={downloadConfig}>
        <Download className="size-4 mr-2" />
        Download pipes-starter.json
      </Button>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-200">
          <span className="font-semibold">Next steps:</span> After running the command, follow the README instructions
          in your new project folder.
        </p>
      </div>
    </section>
  )
}
