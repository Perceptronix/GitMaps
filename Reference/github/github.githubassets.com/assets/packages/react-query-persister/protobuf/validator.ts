import {type DescMessage, schemaHash} from '@github-ui/dotcom-schema/protobuf'
import type {Validator} from '@github-ui/safe-indexed-db-storage'

export function createProtoValidator(schema: DescMessage): Validator {
  const hash = schemaHash(schema)
  return {
    // Validation comes from the protobuf hash. If the schema changes the hash changes which invalidates the cached data.
    Check(value: unknown) {
      return typeof value === 'object' && value !== null
    },
    Code() {
      return `proto:${hash}`
    },
    Errors() {
      return []
    },
  }
}
