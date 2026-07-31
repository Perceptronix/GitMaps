import {isMacOS} from '@github-ui/get-os'
import {getImageSizeFromFile as imageUtilsGetImageSizeFromFile, RETINA_PPI} from '@github-ui/image-utils'

import type {ImageDimensions} from './types'

export const getSelectedLineRange = (textarea: HTMLTextAreaElement): [number, number] => {
  // Subtract one from the caret position so the newline found is not the one _at_ the caret position
  // then add one because we don't want to include the found newline. Also changes -1 (not found) result to 0
  const start = textarea.value.lastIndexOf('\n', textarea.selectionStart - 1) + 1

  // activeLineEnd will be the index of the next newline inclusive, which works because slice is last-index exclusive
  let end = textarea.value.indexOf('\n', textarea.selectionEnd)
  if (end === -1) end = textarea.value.length

  return [start, end]
}

/**
 * Generate a markdown HTML comment with escaped dashes
 */
export const markdownComment = (text: string) => `<!-- ${text.replaceAll('--', '\\-\\-')} -->`

/**
 * Generate markdown link text with escaped brackets and parentheses
 */
export const markdownLink = (text: string, url: string) =>
  `[${text.replaceAll('[', '\\[').replaceAll(']', '\\]')}](${url.replaceAll('(', '\\(').replaceAll(')', '\\)')})`

export const isModifierKey = (event: KeyboardEvent | React.KeyboardEvent<unknown>) =>
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  isMacOS() ? event.metaKey : event.ctrlKey

export const getImageSizeFromFile = async (file: File) => {
  const result = await imageUtilsGetImageSizeFromFile(file)
  if (!result) return null

  // Adapt from pixelsPerInch to ppi for backward compatibility
  return {
    width: result.width,
    height: result.height,
    ppi: result.pixelsPerInch ?? 72,
  }
}

const escapeHtml = (unsafe: string) =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * Generate markdown image tag with dimensions, accounting for retina displays
 * Handles HTML escaping of alt text and src URLs
 */
export const markdownImageTag = (dimensions: ImageDimensions, src: string, alt: string = 'Image') => {
  const safeAlt = escapeHtml(alt)
  const safeSrc = escapeHtml(src)

  if (dimensions.ppi === RETINA_PPI) {
    const width = Math.round(dimensions.width / 2)
    const height = Math.round(dimensions.height / 2)
    // eslint-disable-next-line github/unescaped-html-literal
    return `<img width="${width}" height="${height}" alt="${safeAlt}" src="${safeSrc}" />`
  }

  if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
    // eslint-disable-next-line github/unescaped-html-literal
    return `<img width="${dimensions.width}" height="${dimensions.height}" alt="${safeAlt}" src="${safeSrc}" />`
  }

  return `![${safeAlt}](${safeSrc})`
}
