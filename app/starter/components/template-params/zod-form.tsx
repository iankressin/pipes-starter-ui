import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

type ZodFormProps = {
  schema: z.ZodObject<any>
  defaultValues?: Record<string, any>
  onSubmit: (data: Record<string, any>) => void
  onCancel?: () => void
  submitLabel?: string
}

function getZodDefaults(schema: z.ZodObject<any>): Record<string, any> {
  const defaults: Record<string, any> = {}
  const shape = schema.shape

  for (const key in shape) {
    const field = shape[key]
    
    // Unwrap if it's a ZodDefault
    let actualField = field
    if (field._def?.typeName === 'ZodDefault') {
      defaults[key] = field._def.defaultValue()
      actualField = field._def.innerType
    }

    // Check the actual type
    const typeName = actualField._def?.typeName
    if (typeName === 'ZodArray' && !defaults[key]) {
      defaults[key] = ''
    }
  }

  return defaults
}

function getFieldMetadata(schema: z.ZodObject<any>, key: string) {
  const field = schema.shape[key]
  let actualField = field
  let hasDefault = false

  // Unwrap ZodDefault
  if (field._def?.typeName === 'ZodDefault') {
    hasDefault = true
    actualField = field._def.innerType
  }

  // Get description from metadata
  const description = field.description || actualField.description || key

  // Determine the type
  const typeName = actualField._def?.typeName
  let fieldType: 'string' | 'number' | 'array' = 'string'

  if (typeName === 'ZodArray') {
    fieldType = 'array'
  } else if (typeName === 'ZodNumber') {
    fieldType = 'number'
  }

  return { fieldType, description, hasDefault }
}

export function ZodForm({ schema, defaultValues, onSubmit, onCancel, submitLabel = 'Save' }: ZodFormProps) {
  const zodDefaults = getZodDefaults(schema)
  const initialValues = { ...zodDefaults, ...defaultValues }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    reset(initialValues)
  }, [schema, defaultValues])

  const onFormSubmit = handleSubmit((data) => {
    // Transform array fields from comma-separated strings to arrays
    const transformedData = { ...data }
    const shape = schema.shape

    for (const key in shape) {
      const { fieldType } = getFieldMetadata(schema, key)
      if (fieldType === 'array' && typeof transformedData[key] === 'string') {
        transformedData[key] = transformedData[key]
          .split(',')
          .map((v: string) => v.trim())
          .filter((v: string) => v.length > 0)
      }
    }

    onSubmit(transformedData)
  })

  const fields = Object.keys(schema.shape)

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      {fields.map((key) => {
        const { fieldType, description } = getFieldMetadata(schema, key)
        const error = errors[key]

        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium text-white">
              {description}
            </Label>
            {fieldType === 'array' ? (
              <>
                <Textarea
                  id={key}
                  {...register(key)}
                  placeholder="Comma-separated values"
                  className="min-h-[80px] resize-none"
                />
                <p className="text-xs text-muted-foreground">Enter values separated by commas</p>
              </>
            ) : (
              <Input
                id={key}
                type={fieldType === 'number' ? 'number' : 'text'}
                {...register(key, { valueAsNumber: fieldType === 'number' })}
              />
            )}
            {error && <p className="text-xs text-red-500">{error.message as string}</p>}
          </div>
        )
      })}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
