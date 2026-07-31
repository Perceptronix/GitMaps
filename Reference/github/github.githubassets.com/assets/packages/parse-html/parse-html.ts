export function parseHTML(document: Document, html: string): DocumentFragment {
  const template = document.createElement('template')
  // eslint-disable-next-line @github-ui/github-monorepo/require-set-sanitized-inner-html -- assigns caller-provided HTML string at a generic DOM boundary; cannot be typed as SanitizedHTML here
  template.innerHTML = html
  return document.importNode(template.content, true)
}
