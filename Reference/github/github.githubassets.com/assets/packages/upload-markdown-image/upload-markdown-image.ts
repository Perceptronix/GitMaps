import type {Attachment} from '@github-ui/file-attachment/attachment'
import type {UploadState} from '@github-ui/batch-upload'
import {getImageSizeFromFile, markdownImageTag} from '@github-ui/markdown-editor/utils'

function isVideo(attachment: Attachment): boolean {
  return ['video/mp4', 'video/quicktime'].includes(attachment.file.type)
}

function parameterizeName(name: string): string {
  return name
    .replace(/[[\]\\"<>&]/g, '.')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.|\.$/gi, '')
}

export function placeholderText(attachment: Attachment): string {
  if (isVideo(attachment)) return `\nUploading ${attachment.file.name}…\n`

  const prefix = attachment.isImage() || attachment.file.type === 'image/webp' ? '!' : ''
  return `${prefix}[Uploading ${attachment.file.name}…]()`
}

export function altText(name: string): string {
  return parameterizeName(name)
    .replace(/\.[^.]+$/, '')
    .replace(/\./g, ' ')
}

export function mdLink(attachment: Attachment): string {
  return `[${attachment.file.name}](${attachment.href})`
}

export function videoMarkdown(attachment: Attachment): string {
  return `\n${attachment.href || ''}\n`
}

export async function imageTag(attachment: Attachment): Promise<string> {
  const dimensions = await imageSize(attachment.file)
  const alt = altText(attachment.file.name)
  const src = attachment.href || ''
  return markdownImageTag(dimensions, src, alt)
}

async function imageSize(file: File): Promise<{width: number; height: number; ppi: number}> {
  try {
    const size = await getImageSizeFromFile(file)
    return size || {width: 0, height: 0, ppi: 0}
  } catch {
    return {width: 0, height: 0, ppi: 0}
  }
}

export function replacementText(attachment: Attachment): string {
  const placeholder = placeholderText(attachment)
  if (isVideo(attachment)) {
    return `\n${placeholder}\n`
  }
  return `${placeholder}\n`
}

export async function completedTagText(attachment: Attachment): Promise<string> {
  if (attachment.isImage() || attachment.file.type === 'image/webp') {
    return imageTag(attachment)
  } else if (isVideo(attachment)) {
    return videoMarkdown(attachment)
  }
  return mdLink(attachment)
}

export interface MarkdownUploadOptions {
  getTextarea: () => HTMLTextAreaElement | null
  onSubmitToggle?: (disabled: boolean) => void
  onStateChange?: (state: UploadState, message?: string) => void
}
