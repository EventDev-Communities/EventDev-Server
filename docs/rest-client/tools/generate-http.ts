import fs from 'node:fs'
import path from 'node:path'

interface OpenApiSchema {
  paths: Record<string, PathItem>
  components?: {
    schemas?: Record<string, Schema>
  }
}

interface PathItem {
  [method: string]: Operation | unknown
}

interface Operation {
  summary?: string
  operationId?: string
  requestBody?: RequestBody
  parameters?: Parameter[]
}

interface Parameter {
  name: string
  in: string
  required?: boolean
  schema?: Schema
  example?: unknown
}

interface RequestBody {
  content?: Record<string, MediaType>
}

interface MediaType {
  schema?: Schema
  example?: unknown
}

interface Schema {
  type?: string
  properties?: Record<string, Schema>
  example?: unknown
  $ref?: string
}

const openApiPath = path.join(process.cwd(), 'docs', 'openapi.json')
const outputPath = path.join(process.cwd(), 'docs', 'rest-client', 'api.http')

if (!fs.existsSync(openApiPath)) {
  console.error('docs/openapi.json not found. Please run the app to generate it first.')
  process.exit(1)
}

const openApi = JSON.parse(fs.readFileSync(openApiPath, 'utf-8')) as OpenApiSchema

let output = `@baseUrl = http://localhost:3000
@authToken = <your_token_here>

`

function getPrimitiveExample(schema: Schema): unknown {
  if (schema.type === 'string') {
    return schema.example ?? 'string'
  }
  if (schema.type === 'number' || schema.type === 'integer') {
    return schema.example ?? 0
  }
  if (schema.type === 'boolean') {
    return schema.example ?? true
  }
  if (schema.type === 'array') {
    return []
  }
  return null
}

function getExampleFromSchema(schema: Schema, openApi: OpenApiSchema): unknown {
  if (schema.example !== undefined) {
    return schema.example
  }

  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop()
    if (refName && openApi.components?.schemas?.[refName]) {
      return getExampleFromSchema(openApi.components.schemas[refName], openApi)
    }
  }

  if (schema.type === 'object' && schema.properties) {
    const example: Record<string, unknown> = {}
    for (const [key, prop] of Object.entries(schema.properties)) {
      example[key] = getExampleFromSchema(prop, openApi)
    }
    return example
  }

  return getPrimitiveExample(schema)
}

for (const [route, methods] of Object.entries(openApi.paths)) {
  for (const [method, details] of Object.entries(methods)) {
    if (method === 'parameters' || method === 'summary' || method === 'description') {
      continue
    }

    const operation = details as Operation
    const summary = operation.summary || ''
    const operationId = operation.operationId || ''

    output += `### ${summary || operationId}\n`
    output += `${method.toUpperCase()} {{baseUrl}}${route} HTTP/1.1\n`
    output += `Content-Type: application/json\n`
    output += `Authorization: Bearer {{authToken}}\n`

    output += `\n`

    // Try to find a body example
    if (operation.requestBody?.content?.['application/json']) {
      const mediaType = operation.requestBody.content['application/json']
      let example = mediaType.example

      if (example === undefined && mediaType.schema) {
        example = getExampleFromSchema(mediaType.schema, openApi)
      }

      if (example !== undefined) {
        output += `${JSON.stringify(example, null, 2)}\n\n`
      } else {
        output += '{}\n\n'
      }
    } else if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
      output += '{}\n\n'
    } else {
      output += '\n'
    }
  }
}

const dir = path.dirname(outputPath)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

fs.writeFileSync(outputPath, output)
process.stdout.write(`Generated ${outputPath}\n`)
