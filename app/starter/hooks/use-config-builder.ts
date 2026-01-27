import { useMemo } from 'react'
import type { TemplateId, TemplateParamsState, PipesConfig, NetworkType, PackageManager, Sink } from '../types'
import { buildPipesConfig, generateCliCommand } from '../utils/config-generator'

export function useConfigBuilder(
  projectFolder: string,
  networkType: NetworkType,
  packageManager: PackageManager,
  network: string,
  selectedTemplates: TemplateId[],
  templateParams: TemplateParamsState,
  sink: Sink
) {
  const config: PipesConfig = useMemo(
    () => buildPipesConfig(projectFolder, networkType, packageManager, network, selectedTemplates, templateParams, sink),
    [projectFolder, networkType, packageManager, network, selectedTemplates, templateParams, sink]
  )

  const configJson = useMemo(() => JSON.stringify(config, null, 2), [config])

  const command = useMemo(() => generateCliCommand(config), [config])

  return { config, configJson, command }
}
