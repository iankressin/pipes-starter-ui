import { networks as cliNetworks } from '@iankressin/pipes-cli/config/networks'
import { sinks as cliSinks } from '@iankressin/pipes-cli/config/sinks'
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Github, Twitter } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Logo } from '~/components/ui/logo'
import { cn } from '~/lib/utils'
import type {
  NetworkType,
  StarterStep,
  NetworkSummary,
  SinkOption,
  TemplateOption,
  TemplateId,
  PackageManager,
  Sink,
  StepConfig,
} from './types'
import { sanitizeProjectFolder } from './utils/validation'
import { useConfigBuilder } from './hooks/use-config-builder'
import { useTemplateParams } from './hooks/use-template-params'
import { StepIndicator } from './components/step-indicator'
import { SidePanel } from './components/side-panel'
import { ProjectStep } from './components/steps/project-step'
import { PackageManagerStep } from './components/steps/package-manager-step'
import { NetworkStep } from './components/steps/network-step'
import { PipelineStep } from './components/steps/pipeline-step'
import { SinkStep } from './components/steps/sink-step'
import { SummaryStep } from './components/steps/summary-step'
import { CommandStep } from './components/steps/command-step'
import { needsParams } from './template-metadata'

const networks = cliNetworks as Record<NetworkType, readonly NetworkSummary[]>
const sinks = cliSinks as readonly SinkOption[]

// Template options for each network type
const templateOptions: Record<NetworkType, TemplateOption[]> = {
  evm: [
    { name: 'ERC20 Transfers', id: 'erc20Transfers' },
    { name: 'Uniswap V3 Swaps', id: 'uniswapV3Swaps' },
    { name: 'Morpho Blue', id: 'morphoBlue' },
    { name: 'Uniswap V4', id: 'uniswapV4' },
    { name: 'Polymarket', id: 'polymarket' },
    { name: 'Custom contracts', id: 'custom' },
  ],
  svm: [
    { name: 'Token Balances', id: 'tokenBalances' },
    { name: 'Custom contracts', id: 'custom' },
  ],
}

const steps: StepConfig[] = [
  { id: 'project', label: 'Project', helper: 'Name your workspace' },
  { id: 'packageManager', label: 'Package', helper: 'Choose your package manager' },
  { id: 'network', label: 'Network', helper: 'Pick your chain' },
  { id: 'pipeline', label: 'Pipeline', helper: 'Select templates' },
  { id: 'sink', label: 'Storage', helper: 'Where data lands' },
  { id: 'summary', label: 'Review', helper: 'Double-check choices' },
  { id: 'command', label: 'Generate', helper: 'Ready to run' },
]

export function PipesStarter() {
  const [activeStep, setActiveStep] = useState<StarterStep>('project')
  const [projectName, setProjectName] = useState('')
  const [packageManager, setPackageManager] = useState<PackageManager>('pnpm')
  const [networkType, setNetworkType] = useState<NetworkType>('evm')
  const [selectedNetwork, setSelectedNetwork] = useState<string>('')
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateId[]>([])
  const { templateParams, updateTemplateParams, clearTemplateParams } = useTemplateParams()
  const [selectedSink, setSelectedSink] = useState<Sink>()
  const [configHash, setConfigHash] = useState<string | null>(null)
  const [savingConfig, setSavingConfig] = useState(false)

  const sanitizedProjectName = useMemo(() => sanitizeProjectFolder(projectName), [projectName])

  // Build config
  const { config, command } = useConfigBuilder(
    sanitizedProjectName,
    networkType,
    packageManager,
    selectedNetwork,
    selectedTemplates,
    templateParams,
    selectedSink || 'memory'
  )

  // Navigation
  const canContinue = useMemo(() => {
    if (activeStep === 'project') return Boolean(projectName.trim())
    if (activeStep === 'packageManager') return Boolean(packageManager)
    if (activeStep === 'network') return Boolean(selectedNetwork)
    if (activeStep === 'pipeline') {
      if (selectedTemplates.length === 0) return false
      // Check if all selected templates that need params have them
      for (const templateId of selectedTemplates) {
        if (needsParams(templateId) && !templateParams.has(templateId)) {
          return false
        }
      }
      return true
    }
    if (activeStep === 'sink') return Boolean(selectedSink)
    return true
  }, [activeStep, projectName, packageManager, selectedNetwork, selectedTemplates, selectedSink, networkType, templateParams])

  const goTo = (step: StarterStep) => setActiveStep(step)

  const goNext = async () => {
    const currentIndex = steps.findIndex((s) => s.id === activeStep)
    const next = steps[currentIndex + 1]
    
    // When moving from summary to command, save config to DB
    if (activeStep === 'summary' && next?.id === 'command') {
      setSavingConfig(true)
      try {
        const response = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonConfig: JSON.stringify(config) }),
        })

        if (response.ok) {
          const { hash } = await response.json()
          setConfigHash(hash)
        }
      } catch (error) {
        console.error('Failed to save config:', error)
        // Fall back to showing full command
        setConfigHash(null)
      } finally {
        setSavingConfig(false)
      }
    }
    
    if (next) setActiveStep(next.id)
  }

  const goBack = () => {
    const currentIndex = steps.findIndex((s) => s.id === activeStep)
    const prev = steps[currentIndex - 1]
    if (prev) setActiveStep(prev.id)
  }

  const handleTemplateToggle = (templateId: TemplateId) => {
    setSelectedTemplates((prev) => {
      if (prev.includes(templateId)) {
        clearTemplateParams(templateId)
        return prev.filter((id) => id !== templateId)
      }
      return [...prev, templateId]
    })
  }

  const handleNetworkTypeChange = (type: NetworkType) => {
    setNetworkType(type)
    setSelectedNetwork('')
    setSelectedTemplates([])
    // Clear all template params when changing network type
    selectedTemplates.forEach(clearTemplateParams)
  }

  // Get readable values for summary
  const networkName = networks[networkType]?.find((n) => n.slug === selectedNetwork)?.name || selectedNetwork
  const sinkName = sinks.find((s) => s.id === selectedSink)?.name || selectedSink || ''
  const templateNames = selectedTemplates.map(id => {
    const opt = templateOptions[networkType]?.find(t => t.id === id)
    return opt?.name || id
  }).join(', ')

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <StepIndicator steps={steps} currentStep={activeStep} />
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
                    <Button size="sm" onClick={goNext} disabled={!canContinue || activeStep === 'command' || savingConfig}>
                      {savingConfig ? 'Saving...' : 'Next'}
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {activeStep === 'project' && (
                  <ProjectStep
                    projectName={projectName}
                    sanitizedName={sanitizedProjectName}
                    onProjectNameChange={setProjectName}
                  />
                )}

                {activeStep === 'packageManager' && (
                  <PackageManagerStep selected={packageManager} onSelect={setPackageManager} />
                )}

                {activeStep === 'network' && (
                  <NetworkStep
                    networkType={networkType}
                    networks={networks}
                    selectedNetwork={selectedNetwork}
                    onNetworkTypeChange={handleNetworkTypeChange}
                    onNetworkSelect={setSelectedNetwork}
                  />
                )}

                {activeStep === 'pipeline' && (
                  <PipelineStep
                    networkType={networkType}
                    network={selectedNetwork}
                    templateOptions={templateOptions}
                    selectedTemplates={selectedTemplates}
                    templateParams={templateParams}
                    onTemplateToggle={handleTemplateToggle}
                    onTemplateParamsUpdate={updateTemplateParams}
                  />
                )}

                {activeStep === 'sink' && (
                  <SinkStep sinks={sinks} selectedSink={selectedSink} onSinkSelect={setSelectedSink} />
                )}

                {activeStep === 'summary' && (
                  <SummaryStep
                    projectName={sanitizedProjectName}
                    packageManager={packageManager}
                    networkName={networkName}
                    networkSlug={selectedNetwork}
                    templates={selectedTemplates}
                    templateNames={templateNames}
                    sinkName={sinkName}
                    onEdit={goTo}
                  />
                )}

                {activeStep === 'command' && <CommandStep command={command} configHash={configHash} />}
              </CardContent>

              <div className="flex gap-2 border-t border-white/5 p-4 sm:hidden">
                <Button variant="ghost" size="sm" onClick={goBack} disabled={activeStep === 'project'} className="flex-1">
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button size="sm" onClick={goNext} disabled={!canContinue || activeStep === 'command' || savingConfig} className="flex-1">
                  {savingConfig ? 'Saving...' : 'Next'}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </Card>

            <SidePanel
              projectName={sanitizedProjectName}
              packageManager={packageManager}
              networkType={networkType}
              selectedNetwork={selectedNetwork}
              selectedTemplates={selectedTemplates}
              templateParams={templateParams}
              selectedSink={selectedSink}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function StarterHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-sm font-medium text-white">Pipes SDK</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <a href="https://docs.subsquid.io/subsquid-network/reference/pipes-sdk" target="_blank" rel="noreferrer">
              <BookOpen className="size-4" />
              <span className="hidden sm:inline">Docs</span>
              <ExternalLink className="size-3" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <a href="https://github.com/subsquid/pipes-sdk" target="_blank" rel="noreferrer">
              <Github className="size-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <a href="https://twitter.com/subsquid" target="_blank" rel="noreferrer">
              <Twitter className="size-4" />
              <span className="hidden sm:inline">Twitter</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
