// Runtime registry mapping each generated message schema to its
// schema-derived hash.
//
// Hashes are registered as a side effect of importing a generated `_pb.ts`
// module: codegen appends `registerSchemaHash(<Schema>, "<hash>")` calls to
// the bottom of each `_pb.ts` (see scripts/sync.ts). Because the call lives in
// the same module as the schema it references, only the schemas a bundle
// actually imports contribute their hash — there is no aggregated map that
// would force every namespace into one chunk.
//
// This module deliberately has no dependencies beyond the type-only
// `DescMessage` import so that importing a generated type module stays cheap.

import type {DescMessage} from '@bufbuild/protobuf'

const registry = new WeakMap<DescMessage, string>()

/**
 * Associates a generated message schema with its schema-derived hash. Called
 * from generated `_pb.ts` modules at import time; not intended to be called by
 * hand.
 */
export function registerSchemaHash(schema: DescMessage, hash: string): void {
  registry.set(schema, hash)
}

/**
 * Returns a stable, schema-derived hash for the given message schema.
 *
 * The hash is the first 12 hex characters of a SHA-256 over the canonical
 * `DescriptorProto` bytes, so it only changes when the wire format of the
 * message changes (new/removed/renamed/retyped fields, etc.). This makes it
 * suitable as a cache version key for the persister: cached entries become
 * automatically invalid when the schema they were validated against changes.
 *
 * Throws if the schema's module has not been imported (so its hash was never
 * registered), which should only happen for messages defined outside this
 * package.
 */
export function schemaHash(schema: DescMessage): string {
  const hash = registry.get(schema)
  if (!hash) {
    throw new Error(`No schema hash registered for ${schema.typeName}`)
  }
  return hash
}
