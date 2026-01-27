// Re-export types from CLI
export type NetworkType = 'evm' | 'svm'
export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'bun'
export type Sink = 'clickhouse' | 'postgresql' | 'memory'

// Step types
export type StarterStep = 'project' | 'packageManager' | 'network' | 'pipeline' | 'sink' | 'summary' | 'command'

// Template IDs
export type TemplateId =
  | 'erc20Transfers'
  | 'uniswapV3Swaps'
  | 'morphoBlue'
  | 'uniswapV4'
  | 'polymarket'
  | 'tokenBalances'
  | 'custom'

// Network summary
export type NetworkSummary = {
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

// Sink option
export type SinkOption = {
  name: string
  id: Sink
}

// Template option
export type TemplateOption = {
  name: string
  id: TemplateId
}

// Template configuration matching CLI schema
export type TemplateConfig = {
  templateId: TemplateId
  params?: Record<string, any>
}

// Contract metadata for custom template
export type ContractEvent = {
  name: string
  type: string
  inputs: { name: string; type: string }[]
}

export type ContractMetadata = {
  contractAddress: string
  contractName: string
  contractEvents: ContractEvent[]
}

// Template parameter state
export type TemplateParamsState = Map<TemplateId, Record<string, any>>

// Final config JSON matching CLI schema
export type PipesConfig = {
  projectFolder: string
  networkType: NetworkType
  packageManager: PackageManager
  network: string
  templates: TemplateConfig[]
  sink: Sink
}

// UI state
export type StarterState = {
  currentStep: StarterStep
  projectName: string
  packageManager: PackageManager
  networkType: NetworkType
  selectedNetwork: string
  selectedTemplates: TemplateId[]
  templateParams: TemplateParamsState
  selectedSink: Sink
}

// Step configuration
export type StepConfig = {
  id: StarterStep
  label: string
  helper: string
}

// Package manager option
export type PackageManagerOption = {
  value: PackageManager
  name: string
  description: string
}
