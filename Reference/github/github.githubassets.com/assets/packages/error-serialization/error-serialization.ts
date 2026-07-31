import {parse as parseStacktrace} from 'stacktrace-parser'

export function stacktrace(error: Error): PlatformStackframe[] {
  return parseStacktrace(error.stack || '').map(frame => ({
    filename: frame.file || '',
    function: String(frame.methodName),
    lineno: (frame.lineNumber || 0).toString(),
    colno: (frame.column || 0).toString(),
  }))
}

export function formatError(
  error: Error & {catalogService?: string; catalogServiceHash?: string},
): PlatformJavascriptError {
  return {
    type: error.name,
    value: error.message,
    stacktrace: stacktrace(error),
    catalogService: error.catalogService || currentCatalogService(),
    catalogServiceHash: error.catalogServiceHash || currentCatalogServiceHash(),
  }
}

function currentCatalogService() {
  return globalThis.document?.head?.querySelector<HTMLMetaElement>('meta[name="current-catalog-service"]')?.content
}

function currentCatalogServiceHash() {
  return globalThis.document?.head?.querySelector<HTMLMetaElement>('meta[name="current-catalog-service-hash"]')?.content
}
