import { useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { NetworkType, TemplateId, TemplateOption, TemplateParamsState, ContractMetadata } from '../../types'
import { ZodForm } from '../template-params/zod-form'
import { CustomTemplateForm } from '../template-params/custom-template-form'
import { cn } from '~/lib/utils'
import { getTemplateMetadata, needsParams } from '../../template-metadata'

type PipelineStepProps = {
  networkType: NetworkType
  network: string
  templateOptions: Record<NetworkType, readonly TemplateOption[]>
  selectedTemplates: TemplateId[]
  templateParams: TemplateParamsState
  onTemplateToggle: (templateId: TemplateId) => void
  onTemplateParamsUpdate: (templateId: TemplateId, params: Record<string, any>) => void
}

const disabledTemplateIds = ['morphoBlue', 'uniswapV4', 'polymarket']

export function PipelineStep({
  networkType,
  network,
  templateOptions,
  selectedTemplates,
  templateParams,
  onTemplateToggle,
  onTemplateParamsUpdate,
}: PipelineStepProps) {
  const [expandedTemplates, setExpandedTemplates] = useState<Set<TemplateId>>(new Set())

  const availableTemplates = templateOptions[networkType] || []

  const handleTemplateSelect = (templateId: TemplateId) => {
    onTemplateToggle(templateId)
    // If selecting and has params, expand it
    if (!selectedTemplates.includes(templateId)) {
      if (needsParams(templateId)) {
        setExpandedTemplates(prev => new Set(prev).add(templateId))
      }
    }
  }

  const handleParamsSubmit = (templateId: TemplateId, params: Record<string, any>) => {
    onTemplateParamsUpdate(templateId, params)
    // Close after saving
    setExpandedTemplates(prev => {
      const next = new Set(prev)
      next.delete(templateId)
      return next
    })
  }

  const toggleExpanded = (templateId: TemplateId) => {
    setExpandedTemplates(prev => {
      const next = new Set(prev)
      if (next.has(templateId)) {
        next.delete(templateId)
      } else {
        next.add(templateId)
      }
      return next
    })
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Choose one or more templates. Each template comes pre-configured with transformers, schemas, and
          migrations. Custom contracts fetch ABIs automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {availableTemplates.map((templateOption) => {
          const disabled = disabledTemplateIds.includes(templateOption.id)
          const isSelected = selectedTemplates.includes(templateOption.id)
          const templateNeedsParams = needsParams(templateOption.id)
          const hasParams = templateParams.has(templateOption.id)

          return (
            <div
              key={templateOption.id}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
              onClick={() => (disabled ? undefined : handleTemplateSelect(templateOption.id))}
              onKeyDown={(e) => {
                if (disabled) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTemplateSelect(templateOption.id)
                }
              }}
              className={cn(
                'relative rounded-xl border border-white/5 bg-black/20 p-4 text-left transition-all hover:-translate-y-[1px] hover:border-white/20 hover:bg-black/30 disabled:cursor-not-allowed',
                isSelected &&
                  'border-purple-400/80 bg-purple-500/20 ring-2 ring-purple-400/30 hover:bg-purple-500/15',
                disabled && 'opacity-60',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-white">{templateOption.name}</div>
                    {isSelected && templateNeedsParams && (
                      <Badge variant={hasParams ? 'default' : 'secondary'} className="text-xs">
                        {hasParams ? 'Configured' : 'Needs config'}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{templateOption.id}</div>
                </div>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    onTemplateToggle(templateOption.id)
                    if (checked && templateNeedsParams) {
                      setExpandedTemplates(prev => new Set(prev).add(templateOption.id))
                    }
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
            </div>
          )
        })}
      </div>

      {/* Parameter Collection Section */}
      {selectedTemplates.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">Template Configuration</h3>
          {selectedTemplates.map((templateId) => {
            const templateOption = availableTemplates.find((t) => t.id === templateId)
            const metadata = getTemplateMetadata(templateId)
            const templateNeedsParams = needsParams(templateId)
            const hasParams = templateParams.has(templateId)
            const isExpanded = expandedTemplates.has(templateId)

            if (!templateNeedsParams) return null

            return (
              <Card key={templateId} className="border-white/10 bg-black/30">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleExpanded(templateId)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white">{templateOption?.name || templateId}</CardTitle>
                    <Badge variant={hasParams ? 'default' : 'secondary'} className="text-xs">
                      {hasParams ? 'Configured' : 'Configure'}
                    </Badge>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    {templateId === 'custom' ? (
                      <CustomTemplateForm
                        networkType={networkType}
                        network={network}
                        defaultValues={templateParams.get(templateId) as { contracts?: ContractMetadata[] }}
                        onSubmit={(data) => handleParamsSubmit(templateId, data)}
                        onCancel={() => toggleExpanded(templateId)}
                      />
                    ) : metadata?.paramsSchema ? (
                      <ZodForm
                        schema={metadata.paramsSchema}
                        defaultValues={templateParams.get(templateId) || metadata.defaultParams}
                        onSubmit={(data) => handleParamsSubmit(templateId, data)}
                        onCancel={() => toggleExpanded(templateId)}
                      />
                    ) : null}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
