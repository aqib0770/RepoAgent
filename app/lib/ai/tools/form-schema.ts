import type { FormFieldSchema } from 'corsair'

export function formFieldToJsonSchema(field: FormFieldSchema): Record<string, unknown> {
  const base: Record<string, unknown> = {}
  if (field.description) base.description = field.description

  switch (field.kind) {
    case 'string':
      base.type = 'string'
      if (field.enum) base.enum = field.enum
      break
    case 'number':
      base.type = 'number'
      break
    case 'boolean':
      base.type = 'boolean'
      break
    case 'literal':
      base.type = typeof field.value === 'number' ? 'number' : 'boolean'
      if (base.type === 'boolean') delete base.type
      base.const = field.value
      break
    case 'object': {
      base.type = 'object'
      const properties: Record<string, unknown> = {}
      const required: string[] = []
      for (const [key, value] of Object.entries(field.fields)) {
        properties[key] = formFieldToJsonSchema(value)
        if (!value.optional) required.push(key)
      }
      base.properties = properties
      if (required.length > 0) base.required = required
      // Allow Corsair endpoints to accept fields not yet reflected in the schema.
      base.additionalProperties = true
      break
    }
    case 'array':
      base.type = 'array'
      base.items = formFieldToJsonSchema(field.items)
      break
    case 'unknown':
    default:
      break
  }

  if (field.optional && base.type) {
    base.type = Array.isArray(base.type) ? base.type : [base.type, 'null']
  }

  return base
}
