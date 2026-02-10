import { useState } from 'react'
import { Download, Terminal } from 'lucide-react'
import { Code } from '~/components/ui/code'
import { Button } from '~/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import type { PipesConfig } from '../../types'

export const PIPES_STARTER_CONFIG_FILENAME = 'pipes-starter.json'

type CommandStepProps = {
  command: string
  config: PipesConfig
  configHash?: string | null
}

type TabValue = 'config-id' | 'json' | 'file'

export function CommandStep({ command, config, configHash }: CommandStepProps) {
  const [tab, setTab] = useState<TabValue>('config-id')

  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = PIPES_STARTER_CONFIG_FILENAME
    a.click()
    URL.revokeObjectURL(url)
  }

  const configIdCommand = configHash
    ? `npx -y @iankressin/pipes-cli@latest init --config-id ${configHash}`
    : command

  const fileCommand = `npx -y @iankressin/pipes-cli@latest init --config ${PIPES_STARTER_CONFIG_FILENAME}`

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

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config-id">Config ID</TabsTrigger>
          <TabsTrigger value="json">JSON Config</TabsTrigger>
          <TabsTrigger value="file">JSON File</TabsTrigger>
        </TabsList>
        <TabsContent value="config-id" className="mt-3">
          <div className="relative">
            <Code language="bash">{configIdCommand}</Code>
          </div>
        </TabsContent>
        <TabsContent value="json" className="mt-3">
          <div className="relative">
            <Code language="bash">{command}</Code>
          </div>
        </TabsContent>
        <TabsContent value="file" className="mt-3 space-y-3">
          <div className="relative">
            <Code language="bash">{fileCommand}</Code>
          </div>
          <Button variant="outline" size="sm" onClick={downloadConfig}>
            <Download className="size-4 mr-2" />
            Download {PIPES_STARTER_CONFIG_FILENAME}
          </Button>
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-200">
          <span className="font-semibold">Next steps:</span> After running the command, follow the README instructions
          in your new project folder.
        </p>
      </div>
    </section>
  )
}
