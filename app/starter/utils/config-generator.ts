import type { PipesConfig, TemplateConfig, TemplateId, TemplateParamsState } from '../types'

export function buildPipesConfig(
  projectFolder: string,
  networkType: 'evm' | 'svm',
  packageManager: 'pnpm' | 'yarn' | 'npm' | 'bun',
  network: string,
  selectedTemplates: TemplateId[],
  templateParams: TemplateParamsState,
  sink: 'clickhouse' | 'postgresql' | 'memory'
): PipesConfig {
  const templates: TemplateConfig[] = selectedTemplates.map((templateId) => {
    const params = templateParams.get(templateId)
    if (params && Object.keys(params).length > 0) {
      return { templateId, params }
    }
    return { templateId }
  })

  return {
    projectFolder,
    networkType,
    packageManager,
    network,
    templates,
    sink,
  }
}

export function generateCliCommand(config: PipesConfig): string {
  const configJson = JSON.stringify(config, null, 2)
  // Escape single quotes for shell
  const escapedJson = configJson.replace(/'/g, "'\\''")
  return `npx @iankressin/pipes-cli@latest init --config '${escapedJson}'`
}
