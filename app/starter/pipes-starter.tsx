import { networks as cliNetworks } from '@subsquid/pipes-cli/config/networks'
import { sinks as cliSinks } from '@subsquid/pipes-cli/config/sinks'
import { templateOptions as cliTemplateOptions } from '@subsquid/pipes-cli/config/templates'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ExternalLink,
  Github,
  Sparkles,
  Terminal,
  Twitter,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { CopyButton } from '~/components/ui/copy-button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Logo } from '~/components/ui/logo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { cn } from '~/lib/utils'

type PipelineMode = 'templates' | 'custom'

type StarterStep = 'project' | 'network' | 'pipeline' | 'sink' | 'summary' | 'command'

type TemplateId =
  | 'erc20-transfers'
  | 'uniswap-v3-swaps'
  | 'morpho-blue'
  | 'uniswap-v4'
  | 'polymarket'
  | 'token-balances'
  | 'custom'

const chainTypes = [
  { name: 'EVM', value: 'evm' },
  { name: 'SVM', value: 'svm' },
] as const

type NetworkType = (typeof chainTypes)[number]['value']

type NetworkSummary = {
  name: string
  type: string
  tooltip: string | null
  portal: boolean
  realtime: boolean
  slug: string
  details?: string
  chainId?: string
  traces?: boolean
  stateDiffs?: boolean
}

type SinkOption = {
  name: string
  id: string
}

const networks = cliNetworks as Record<NetworkType, readonly NetworkSummary[]>
const sinks = cliSinks as readonly SinkOption[]
const templateOptions = cliTemplateOptions as Record<NetworkType, readonly { name: string; id: TemplateId }[]>

const steps: { id: StarterStep; label: string; helper: string }[] = [
  { id: 'project', label: 'Project', helper: 'Name your workspace' },
  { id: 'network', label: 'Network', helper: 'Pick your chain' },
  { id: 'pipeline', label: 'Pipeline', helper: 'Templates or custom' },
  { id: 'sink', label: 'Storage', helper: 'Where data lands' },
  { id: 'summary', label: 'Review', helper: 'Double-check choices' },
  { id: 'command', label: 'Generate', helper: 'Ready to run' },
]

const disabledTemplateIds = ['morpho-blue', 'uniswap-v4', 'polymarket']

function sanitizeProjectFolder(name: string): string {
  if (!name || name.trim().length === 0) {
    return 'pipes-project'
  }

  let sanitized = name.trim()

  // Replace spaces with dashes
  sanitized = sanitized.replace(/\s+/g, '-')

  // Remove invalid characters: < > : " | ? * and ASCII control characters (0x00-0x1F)
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '')

  // Remove leading/trailing dots and dashes
  sanitized = sanitized.replace(/^[.-]+|[.-]+$/g, '')

  // Remove consecutive dashes
  sanitized = sanitized.replace(/-+/g, '-')

  // Check for reserved Windows names and replace them
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i
  if (reservedNames.test(sanitized)) {
    sanitized = `project-${sanitized}`
  }

  // Ensure it's not empty after sanitization
  if (!sanitized || sanitized.length === 0) {
    return 'pipes-project'
  }

  return sanitized
}

function isValidEVMAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

function isValidSVMAddress(address: string): boolean {
  // Solana addresses are base58 encoded, typically 32-44 characters
  // Base58 excludes: 0, O (uppercase), I (uppercase), l (lowercase) to avoid confusion
  // However, Solana addresses are case-insensitive and validation is more lenient
  // We check length and exclude only: 0, uppercase O, uppercase I
  // Note: We allow lowercase 'i', 'o', and 'l' since Solana addresses can contain them
  if (address.length < 32 || address.length > 44) return false
  // Allow alphanumeric except: 0, uppercase O, uppercase I
  return /^[1-9A-HJ-NP-Za-z]{32,44}$/i.test(address) && !/[0OI]/.test(address)
}

function validateAddress(address: string, chainType?: NetworkType): boolean {
  if (!chainType) return false
  if (chainType === 'evm') return isValidEVMAddress(address)
  if (chainType === 'svm') return isValidSVMAddress(address)
  return false
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}…${address.slice(-6)}`
}

function formatAddresses(raw: string, chainType?: NetworkType): { addresses: string[]; errors: string[] } {
  const items = raw
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean)

  const addresses: string[] = []
  const errors: string[] = []

  items.forEach((item) => {
    if (validateAddress(item, chainType)) {
      addresses.push(item)
    } else {
      errors.push(item)
    }
  })

  return { addresses, errors }
}

export function PipesStarter() {
  const [activeStep, setActiveStep] = useState<StarterStep>('project')
  const [projectName, setProjectName] = useState('')
  const [chainType, setChainType] = useState<NetworkType>()
  const [networkSearch, setNetworkSearch] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState<string>()
  const [pipelineMode, setPipelineMode] = useState<PipelineMode>('templates')
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateId[]>([])
  const [contractInput, setContractInput] = useState('')
  const [selectedSink, setSelectedSink] = useState<(typeof sinks)[number]['id']>()

  const fullNetworkList = chainType ? (networks[chainType] ?? []) : []

  // Don't auto-select network - let user choose

  useEffect(() => {
    if (pipelineMode !== 'templates' || !chainType) return
    const available = new Set(templateOptions[chainType]?.map((template) => template.id))
    setSelectedTemplates((previous) => previous.filter((id) => available.has(id)))
  }, [chainType, pipelineMode])

  const addressValidation = useMemo(() => formatAddresses(contractInput, chainType), [contractInput, chainType])
  const addresses = addressValidation.addresses

  const networkList = useMemo(() => {
    const list = fullNetworkList
    if (!networkSearch) return list
    const q = networkSearch.toLowerCase()
    return list.filter((network) => network.name.toLowerCase().includes(q) || network.slug.toLowerCase().includes(q))
  }, [fullNetworkList, networkSearch])

  const sanitizedProjectName = useMemo(() => sanitizeProjectFolder(projectName), [projectName])

  const configPreview = useMemo(() => {
    return {
      projectFolder: sanitizedProjectName,
      chainType: chainType ?? '',
      network: selectedNetwork ?? '',
      pipelineMode,
      templates: pipelineMode === 'templates' ? selectedTemplates : ['custom'],
      contractAddresses: pipelineMode === 'custom' ? addresses : [],
      sink: selectedSink ?? '',
    }
  }, [addresses, chainType, pipelineMode, sanitizedProjectName, selectedNetwork, selectedSink, selectedTemplates])

  const configJson = useMemo(() => JSON.stringify(configPreview, null, 2), [configPreview])

  const starterCommand = useMemo(
    () => `npx @iankressin/pipes-cli@latest init --config '${configJson.replace(/'/g, "'\\''")}'`,
    [configJson],
  )

  const canContinue = useMemo(() => {
    if (activeStep === 'project') return Boolean(projectName.trim())
    if (activeStep === 'network') return Boolean(selectedNetwork)
    if (activeStep === 'pipeline')
      return pipelineMode === 'templates' ? selectedTemplates.length > 0 : addresses.length > 0
    if (activeStep === 'sink') return Boolean(selectedSink)
    return true
  }, [activeStep, addresses.length, pipelineMode, projectName, selectedNetwork, selectedSink, selectedTemplates.length])

  const goTo = (step: StarterStep) => setActiveStep(step)

  const goNext = () => {
    const currentIndex = steps.findIndex((s) => s.id === activeStep)
    const next = steps[currentIndex + 1]
    if (next) {
      // Set chainType to 'evm' by default when moving from 'project' to 'network' step
      if (activeStep === 'project' && next.id === 'network' && !chainType) {
        setChainType('evm')
      }
      setActiveStep(next.id)
    }
  }

  const goBack = () => {
    const currentIndex = steps.findIndex((s) => s.id === activeStep)
    const prev = steps[currentIndex - 1]
    if (prev) setActiveStep(prev.id)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(101,76,255,0.07),transparent_18%)] pointer-events-none" /> */}
      <div className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10">
        <StarterHeader />

        <main className="container mx-auto max-w-6xl px-4 pb-16 pt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Stream, decode, and persist blockchain data effortlessly
              </div>
              <h1 className="flex items-center text-3xl text-white">🦑 Pipes SDK Starter</h1>
            </div>
            <div className="hidden gap-3 text-sm font-medium text-muted-foreground sm:flex">
              {steps.map((step, idx) => {
                const isActive = step.id === activeStep
                const isDone = steps.findIndex((s) => s.id === activeStep) > idx
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
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="backdrop-blur-lg border-white/10 bg-white/5">
              <CardHeader className="border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">
                      {steps.find((s) => s.id === activeStep)?.label}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {steps.find((s) => s.id === activeStep)?.helper}
                    </CardDescription>
                  </div>
                  <div className="hidden gap-2 sm:flex">
                    <Button variant="ghost" size="sm" onClick={goBack} disabled={activeStep === 'project'}>
                      <ArrowLeft className="size-4" />
                      Back
                    </Button>
                    <Button size="sm" onClick={goNext} disabled={!canContinue || activeStep === 'command'}>
                      Next
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {activeStep === 'project' && (
                  <section className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Give your project a short, memorable name. This will also be used as the folder name when you run
                      the generated command.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project name</Label>
                      <Input
                        id="project-name"
                        placeholder="market-making-bot"
                        value={projectName}
                        onChange={(event) => setProjectName(event.target.value)}
                      />
                      {projectName.trim() && projectName.trim() !== sanitizedProjectName && (
                        <p className="text-xs text-muted-foreground">
                          Folder name will be: <span className="font-mono text-foreground">{sanitizedProjectName}</span>
                        </p>
                      )}
                    </div>
                  </section>
                )}

                {activeStep === 'network' && (
                  <section className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Tabs
                        value={chainType}
                        onValueChange={(value) => setChainType(value as NetworkType)}
                        className="w-full sm:w-auto"
                      >
                        <TabsList className="grid grid-cols-2 lg:w-[300px]">
                          {chainTypes.map((chain) => (
                            <TabsTrigger key={chain.value} value={chain.value} className="text-white">
                              {chain.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>

                      <div className="w-full sm:w-80">
                        <Input
                          placeholder="Search networks…"
                          value={networkSearch}
                          onChange={(event) => setNetworkSearch(event.target.value)}
                          className="bg-black/20 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {networkList.map((network) => {
                        const isSelected = selectedNetwork === network.slug
                        const chainId = 'chainId' in network ? network.chainId : undefined
                        const traces = 'traces' in network ? network.traces : false
                        const stateDiffs = 'stateDiffs' in network ? network.stateDiffs : false
                        return (
                          <button
                            key={network.slug}
                            type="button"
                            onClick={() => setSelectedNetwork(network.slug)}
                            className={cn(
                              'group rounded-xl border border-white/5 bg-black/20 p-4 text-left transition-all hover:-translate-y-[1px] hover:border-white/20 hover:bg-black/30',
                              isSelected &&
                                'border-purple-400/80 bg-purple-500/20 ring-2 ring-purple-400/30 hover:bg-purple-500/15',
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-white">{network.name}</span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-[9px]',
                                    network.type === 'mainnet'
                                      ? 'border-purple-400/50 text-purple-300 bg-purple-500/10'
                                      : 'border-blue-400/50 text-blue-300 bg-blue-500/10',
                                  )}
                                >
                                  {network.type}
                                </Badge>
                              </div>
                              {isSelected ? (
                                <div className="flex size-5 items-center justify-center rounded-full border-2 border-purple-400">
                                  <div className="size-2.5 rounded-full bg-purple-400" />
                                </div>
                              ) : (
                                <div className="size-5 rounded-full border-2 border-white/30" />
                              )}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <Tag>{chainId ? `ChainId: ${chainId}` : 'No chain id'}</Tag>
                              {network.realtime && <Tag>Realtime</Tag>}
                              {traces && <Tag>Traces</Tag>}
                              {stateDiffs && <Tag>State diffs</Tag>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )}

                {activeStep === 'pipeline' && (
                  <section className="space-y-6">
                    <Tabs
                      defaultValue={pipelineMode}
                      value={pipelineMode}
                      onValueChange={(value) => setPipelineMode(value as PipelineMode)}
                    >
                      <TabsList className="grid grid-cols-2 lg:w-[300px]">
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="custom">Custom contract</TabsTrigger>
                      </TabsList>
                      <TabsContent value="templates" className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Choose one or more starter templates. They come pre-wired with transformers, schemas, and
                          migrations.
                        </p>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {chainType &&
                            templateOptions[chainType]?.map((template) => {
                              const disabled = disabledTemplateIds.includes(template.id)
                              const isSelected = selectedTemplates.includes(template.id)
                              return (
                                <button
                                  key={template.id}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => {
                                    setSelectedTemplates((prev) =>
                                      prev.includes(template.id)
                                        ? prev.filter((id) => id !== template.id)
                                        : [...prev, template.id],
                                    )
                                  }}
                                  className={cn(
                                    'relative rounded-xl border border-white/5 bg-black/20 p-4 text-left transition-all hover:-translate-y-[1px] hover:border-white/20 hover:bg-black/30 disabled:cursor-not-allowed',
                                    isSelected &&
                                      'border-purple-400/80 bg-purple-500/20 ring-2 ring-purple-400/30 hover:bg-purple-500/15',
                                    disabled && 'opacity-60',
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-white">{template.name}</div>
                                      </div>
                                      <div className="mt-1 text-xs text-muted-foreground">{template.id}</div>
                                    </div>
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) => {
                                        setSelectedTemplates((prev) =>
                                          checked ? [...prev, template.id] : prev.filter((id) => id !== template.id),
                                        )
                                      }}
                                      disabled={disabled}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  {disabled ? (
                                    <Badge variant="muted" className="mt-3 inline-block text-xs">
                                      Coming soon
                                    </Badge>
                                  ) : (
                                    <p className="mt-3 text-sm text-muted-foreground">
                                      Ready-made events and schemas to get you shipping faster.
                                    </p>
                                  )}
                                </button>
                              )
                            })}
                        </div>
                      </TabsContent>
                      <TabsContent value="custom" className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Provide one or more contract addresses (comma or space separated). We will fetch ABIs and wire
                          the pipeline for you.
                        </p>
                        <div className="space-y-2">
                          <Input
                            placeholder={
                              chainType === 'svm'
                                ? 'Enter Solana program address (e.g., TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA)'
                                : 'Enter contract address (e.g., 0x1234…abcd)'
                            }
                            value={contractInput}
                            onChange={(event) => setContractInput(event.target.value)}
                            className="bg-black/20 text-sm"
                          />
                          {addressValidation.errors.length > 0 && (
                            <div className="text-xs text-destructive">
                              Invalid address{addressValidation.errors.length > 1 ? 'es' : ''}:{' '}
                              {addressValidation.errors.join(', ')}
                              {chainType === 'evm' && ' (EVM addresses must start with 0x and be 42 characters)'}
                              {chainType === 'svm' && ' (Solana addresses must be 32-44 base58 characters)'}
                            </div>
                          )}
                          {addresses.length > 0 && addressValidation.errors.length === 0 && (
                            <div className="text-xs text-muted-foreground">
                              {addresses.length} contract{addresses.length === 1 ? '' : 's'} added
                            </div>
                          )}
                          {addresses.length === 0 && addressValidation.errors.length === 0 && contractInput.trim() && (
                            <div className="text-xs text-muted-foreground">No valid contracts yet</div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </section>
                )}

                {activeStep === 'sink' && (
                  <section className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Select where your indexed data should be stored. You can switch later if needed.
                    </p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {sinks.map((sink) => {
                        const isSelected = sink.id === selectedSink
                        return (
                          <button
                            key={sink.id}
                            type="button"
                            onClick={() => setSelectedSink(sink.id)}
                            className={cn(
                              'group rounded-xl border border-white/5 bg-black/20 p-4 text-left transition-all hover:-translate-y-[1px] hover:border-white/20 hover:bg-black/30',
                              isSelected &&
                                'border-purple-400/80 bg-purple-500/20 ring-2 ring-purple-400/30 hover:bg-purple-500/15',
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-white">{sink.name}</span>
                              </div>
                              {isSelected ? (
                                <div className="flex size-5 items-center justify-center rounded-full border-2 border-purple-400">
                                  <div className="size-2.5 rounded-full bg-purple-400" />
                                </div>
                              ) : (
                                <div className="size-5 rounded-full border-2 border-white/30" />
                              )}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {sink.id === 'clickhouse' && <Tag>Analytics-first</Tag>}
                              {sink.id === 'postgresql' && <Tag>Relational DB</Tag>}
                              {sink.id === 'memory' && <Tag>Prototyping</Tag>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )}

                {activeStep === 'summary' && (
                  <section className="grid gap-4">
                    <SummaryRow
                      title="Project"
                      value={sanitizedProjectName}
                      onEdit={() => goTo('project')}
                      helper={projectName.trim() !== sanitizedProjectName ? `Original: ${projectName}` : 'Folder name'}
                    />
                    <SummaryRow
                      title="Network"
                      value={fullNetworkList.find((n) => n.slug === selectedNetwork)?.name ?? selectedNetwork ?? '—'}
                      helper={selectedNetwork}
                      onEdit={() => goTo('network')}
                    />
                    <SummaryRow
                      title="Pipeline"
                      value={
                        pipelineMode === 'templates' ? `${selectedTemplates.length} template(s)` : 'Custom contract'
                      }
                      helper={
                        pipelineMode === 'templates'
                          ? selectedTemplates.join(', ') || 'None selected'
                          : addresses.map(truncateAddress).join(', ') || 'No contracts yet'
                      }
                      onEdit={() => goTo('pipeline')}
                    />
                    <SummaryRow
                      title="Sink"
                      value={selectedSink ? (sinks.find((s) => s.id === selectedSink)?.name ?? selectedSink) : ''}
                      onEdit={() => goTo('sink')}
                    />
                  </section>
                )}

                {activeStep === 'command' && (
                  <section className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Copy and run the command below. The config is included inline, so you don't need to save it
                      separately.
                    </p>
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Terminal className="size-4 text-primary" />
                          <span>Command</span>
                        </div>
                        <CopyButton content={starterCommand} size="md" variant="outline" />
                      </div>
                      <div className="mt-3 rounded-lg bg-black/60 p-3 font-mono text-sm text-white whitespace-pre-wrap break-all">
                        {starterCommand}
                      </div>
                    </div>
                  </section>
                )}
              </CardContent>

              <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="size-4 text-primary" />
                  <span>
                    Step {steps.findIndex((s) => s.id === activeStep) + 1} of {steps.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={goBack} disabled={activeStep === 'project'}>
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={goNext}
                    disabled={!canContinue || activeStep === 'command'}
                    variant="default"
                  >
                    {activeStep === 'summary' ? (
                      <>
                        Generate command
                        <Terminal className="size-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <SidePanel
              projectName={sanitizedProjectName}
              chainType={chainType}
              selectedNetwork={selectedNetwork}
              selectedSink={selectedSink}
              pipelineMode={pipelineMode}
              templates={selectedTemplates}
              contracts={addresses}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function StarterHeader() {
  return (
    <header className="border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="container mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <div className="text-sm font-medium text-white">Pipes Starter</div>
            <div className="text-xs text-muted-foreground">Guided setup for the Pipes SDK</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-white">
            <a
              href="https://beta.docs.sqd.dev/en/sdk/pipes-sdk/evm.autogenerated/quickstart"
              target="_blank"
              rel="noreferrer"
            >
              <BookOpen className="mr-2 size-4" />
              Docs
              <ExternalLink className="ml-1 size-3.5" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-white">
            <a href="https://github.com/subsquid-labs/pipes-sdk" target="_blank" rel="noreferrer">
              <Github className="mr-2 size-4" />
              GitHub
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-white">
            <a href="https://x.com/helloSQD" target="_blank" rel="noreferrer">
              <Twitter className="mr-2 size-4" />
              @helloSQD
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-muted-foreground">{children}</span>
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

function SidePanel({
  projectName,
  chainType,
  selectedNetwork,
  selectedSink,
  pipelineMode,
  templates,
  contracts,
}: {
  projectName: string
  chainType?: NetworkType
  selectedNetwork?: string
  selectedSink?: (typeof sinks)[number]['id']
  pipelineMode: PipelineMode
  templates: string[]
  contracts: string[]
}) {
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
          <SummaryItem label="Project" value={projectName || ''} />
          <SummaryItem label="Chain" value={chainType ? chainType.toUpperCase() : ''} />
          <SummaryItem label="Network" value={selectedNetwork || ''} />
          <SummaryItem label="Sink" value={selectedSink || ''} />
          <SummaryItem
            label="Pipeline"
            value={
              pipelineMode === 'templates'
                ? templates.join(', ') || ''
                : contracts.map(truncateAddress).join(', ') || ''
            }
          />
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  )
}
