import type {Attachment} from '@github-ui/file-attachment/attachment'
import type {AttachmentUploadDelegate, UploadError, UploadPolicyData} from './attachment-upload'
import {getBaseFetchHeaders} from '@github-ui/fetch-headers'

import AttachmentUpload from './attachment-upload'
import type Batch from './batch'

export type UploadState =
  | 'is-default'
  | 'is-uploading'
  | 'is-bad-file'
  | 'is-duplicate-filename'
  | 'is-too-big'
  | 'is-too-many'
  | 'is-hidden-file'
  | 'is-failed'
  | 'is-bad-dimensions'
  | 'is-empty'
  | 'is-bad-permissions'
  | 'is-repository-required'
  | 'is-bad-format'

export interface UploadConfig {
  policyUrl: string
  csrfToken: string
  repositoryId?: string
  subjectType?: string
  subjectParam?: string
  uploadContainerType?: string
  uploadContainerId?: string
}

export interface UploadCallbacks {
  onStateChange: (state: UploadState, message?: string) => void
  onSetup?: (batch: Batch, attachment: Attachment, form: FormData, preprocess: Array<Promise<unknown>>) => void
  onStart?: (batch: Batch, attachment: Attachment, policy: UploadPolicyData) => void
  onProgress?: (batch: Batch, attachment: Attachment) => void
  onComplete?: (batch: Batch, attachment: Attachment) => void
  onError?: (batch: Batch, attachment: Attachment) => void
  onInvalid?: (batch: Batch, attachment: Attachment) => void
}

function reportAttachmentUploadError(cause: unknown, message: string) {
  setTimeout(() => {
    const attachmentUploadError = new Error(message, {cause})
    attachmentUploadError.name = 'AttachmentUploadError'
    throw attachmentUploadError
  })
}

export async function upload(batch: Batch, config: UploadConfig, callbacks: UploadCallbacks) {
  callbacks.onStateChange('is-uploading')
  const delegate = createDelegate(batch, callbacks)
  for (const attachment of batch.attachments) {
    const policy = await validate(batch, attachment, config, callbacks)
    if (!policy) return
    try {
      const uploader = new AttachmentUpload(attachment, policy)
      await uploader.process(delegate)
    } catch {
      batch.setAttachmentAsFailed(attachment)
      callbacks.onError?.(batch, attachment)
      callbacks.onStateChange('is-failed')
      return
    }
  }
}

async function validate(
  batch: Batch,
  attachment: Attachment,
  config: UploadConfig,
  callbacks: UploadCallbacks,
): Promise<UploadPolicyData | null> {
  const form = buildPolicyForm(attachment, config)
  const preprocess: Array<Promise<unknown>> = []
  callbacks.onSetup?.(batch, attachment, form, preprocess)

  try {
    await Promise.all(preprocess)
    const response = await fetch(buildPolicyRequest(form, config.policyUrl))
    if (response.ok) {
      return await response.json()
    }
    batch.setAttachmentAsFailed(attachment)
    callbacks.onInvalid?.(batch, attachment)
    const body = await response.text()
    const status = response.status
    const {state, message} = policyErrorState({status, body}, attachment.file)
    callbacks.onStateChange(state, message)
  } catch (error) {
    reportAttachmentUploadError(error, 'App assets attachment upload failed: policy request.')
    batch.setAttachmentAsFailed(attachment)
    callbacks.onInvalid?.(batch, attachment)
    callbacks.onStateChange('is-failed')
  }
  return null
}

function buildPolicyForm(attachment: Attachment, config: UploadConfig): FormData {
  const form = new FormData()
  const file = attachment.file
  form.append('name', file.name)
  form.append('size', String(file.size))
  form.append('content_type', file.type)
  // eslint-disable-next-line github/authenticity-token
  form.append('authenticity_token', config.csrfToken)
  if (config.subjectType) form.append('subject_type', config.subjectType)
  if (config.subjectParam) form.append('subject', config.subjectParam)
  if (config.repositoryId) form.append('repository_id', config.repositoryId)
  if (attachment.directory) form.append('directory', attachment.directory)
  if (config.uploadContainerType) form.append('upload_container_type', config.uploadContainerType)
  if (config.uploadContainerType && config.uploadContainerId) {
    form.append('upload_container_id', config.uploadContainerId)
  }
  return form
}

function buildPolicyRequest(form: FormData, policyUrl: string): Request {
  return new Request(policyUrl, {
    method: 'POST',
    body: form,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...getBaseFetchHeaders(),
    },
  })
}

function createDelegate(batch: Batch, callbacks: UploadCallbacks): AttachmentUploadDelegate {
  return {
    attachmentUploadDidStart(attachment, policy) {
      attachment.saving(0)
      callbacks.onStateChange('is-uploading')
      callbacks.onStart?.(batch, attachment, policy)
    },
    attachmentUploadDidProgress(attachment, percent) {
      attachment.saving(percent)
      callbacks.onProgress?.(batch, attachment)
    },
    attachmentUploadDidComplete(attachment, policy, result) {
      attachment.saved(savedAttributes(result, policy))
      callbacks.onComplete?.(batch, attachment)
      if (batch.isFinished()) {
        callbacks.onStateChange('is-default')
      }
    },
    attachmentUploadDidError(attachment, response) {
      batch.setAttachmentAsFailed(attachment)
      callbacks.onError?.(batch, attachment)
      const {state} = policyErrorState(response)
      callbacks.onStateChange(state)
    },
  }
}

function savedAttributes(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  result: any,
  policy: UploadPolicyData,
): {id: string | null; href: string | null; name: string | null} {
  const id =
    // @ts-expect-error id is not defined on asset type
    (result.id == null ? null : String(result.id)) || (policy.asset.id == null ? null : String(policy.asset.id))
  const href =
    (typeof result.href === 'string' ? result.href : null) ||
    // @ts-expect-error href is not defined on asset type
    (typeof policy.asset.href === 'string' ? policy.asset.href : null)
  return {id, href, name: policy.asset.name}
}

type PolicyErrorResult = {
  state: UploadState
  message?: string
}

function policyErrorState(response: UploadError, file?: File): PolicyErrorResult {
  if (response.status === 400) {
    return {state: 'is-bad-file'}
  }

  if (response.status !== 422) {
    return {state: 'is-failed'}
  }

  const hash = JSON.parse(response.body)

  if (!hash || !hash.errors) {
    return {state: 'is-failed'}
  }

  for (const error of hash.errors) {
    switch (error.field) {
      case 'size': {
        const size = file ? file.size : null
        if (size != null && size === 0) {
          return {state: 'is-empty'}
        }
        return {
          state: 'is-too-big',
          message: trimSizeErrorMessage(error.message),
        }
      }
      case 'file_count':
        return {state: 'is-too-many'}
      case 'width':
      case 'height':
        return {state: 'is-bad-dimensions'}
      case 'name':
        if (error.code === 'already_exists') {
          return {state: 'is-duplicate-filename'}
        }
        return {state: 'is-bad-file'}
      case 'content_type':
        return {state: 'is-bad-file'}
      case 'uploader_id':
        return {state: 'is-bad-permissions'}
      case 'repository_id':
        return {state: 'is-repository-required'}
      case 'format':
        return {state: 'is-bad-format'}
    }
  }
  return {state: 'is-failed'}
}

const trimSizeErrorMessage = (message: string) => {
  return message.startsWith('size') ? message.substring(5) : message
}
