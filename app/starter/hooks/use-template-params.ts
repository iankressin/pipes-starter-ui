import { useState, useCallback } from 'react'
import type { TemplateId, TemplateParamsState } from '../types'

export function useTemplateParams() {
  const [templateParams, setTemplateParams] = useState<TemplateParamsState>(new Map())

  const updateTemplateParams = useCallback((templateId: TemplateId, params: Record<string, any>) => {
    setTemplateParams((prev) => {
      const next = new Map(prev)
      next.set(templateId, params)
      return next
    })
  }, [])

  const clearTemplateParams = useCallback((templateId: TemplateId) => {
    setTemplateParams((prev) => {
      const next = new Map(prev)
      next.delete(templateId)
      return next
    })
  }, [])

  const hasParams = useCallback(
    (templateId: TemplateId) => {
      return templateParams.has(templateId)
    },
    [templateParams]
  )

  return {
    templateParams,
    updateTemplateParams,
    clearTemplateParams,
    hasParams,
  }
}
