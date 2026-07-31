import {fire, on} from 'delegated-events'
import type {SimpleResponse} from '@github-ui/remote-form'
import {TemplateInstance} from '@github/template-parts'
import {dialog} from '@github-ui/details-dialog'
import {onInput} from '@github-ui/onfocus'
import {parseHTML} from '@github-ui/parse-html'
import {remoteForm} from '@github-ui/remote-form'
import {requestSubmit} from '@github-ui/form-utils'
import {showGlobalError} from './ajax-error'
import {updateSocialCounts} from './social'
import {getBaseFetchHeaders} from '@github-ui/fetch-headers'

const dirtyUserListPanels = new WeakSet<HTMLElement>()

function syncSelectPanelSelectionsToForm(panel: HTMLElement, form: HTMLFormElement) {
  for (const input of form.querySelectorAll<HTMLInputElement>('.js-user-list-menu-synthetic-input')) {
    input.remove()
  }

  // Remove placeholder so backend only sees actual list IDs
  for (const placeholder of form.querySelectorAll<HTMLInputElement>('input[name="list_ids[]"][value=""]')) {
    placeholder.remove()
  }

  const activeItems = panel.querySelectorAll<HTMLElement>(
    '[data-target~="user-list-menu.listItems"][aria-selected="true"]',
  )

  for (const item of activeItems) {
    const inputName = item.getAttribute('data-input-name')
    const value = item.getAttribute('data-value')
    if (!inputName || !value) continue

    const hidden = document.createElement('input')
    hidden.type = 'hidden'
    hidden.name = inputName
    hidden.value = value
    hidden.classList.add('js-user-list-menu-synthetic-input')
    form.appendChild(hidden)
  }
}

function setFlashError(form: HTMLFormElement, message?: string) {
  const flash = form.querySelector<HTMLElement>('.js-user-list-base')
  if (flash) {
    flash.textContent = message || flash.getAttribute('data-generic-message')
    flash.hidden = false
  }
}

function resetValidation(form: HTMLFormElement, formGroup?: HTMLElement) {
  const container = formGroup || form
  const notes = container.querySelectorAll<HTMLElement>('.js-user-list-error')
  for (const note of notes) {
    note.hidden = true
  }

  const groups = formGroup ? [formGroup] : form.querySelectorAll<HTMLElement>('.errored.js-user-list-input-container')
  for (const group of groups) {
    group.classList.remove('errored')
  }

  const flash = form.querySelector<HTMLElement>('.js-user-list-base')
  if (flash) {
    flash.hidden = true
  }
}

remoteForm('.js-user-list-form', async function (form, wants) {
  resetValidation(form)

  const submitButton = form.querySelector<HTMLButtonElement>('[data-submitting-message]')
  const originalButtonText = submitButton?.textContent
  if (submitButton) {
    submitButton.textContent = submitButton.getAttribute('data-submitting-message')
    submitButton.disabled = true
  }

  for (const input of form.querySelectorAll<HTMLInputElement>('.js-user-list-input')) {
    input.disabled = true
  }

  try {
    const response = await wants.html()
    fire(form, 'user-list-form:success', response.html)
  } catch (error) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (error.response?.status === 422) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      form.replaceWith(error.response.html)
    } else {
      setFlashError(form)

      if (submitButton) {
        if (originalButtonText) submitButton.textContent = originalButtonText
        submitButton.disabled = false
      }

      for (const input of form.querySelectorAll<HTMLInputElement>('.js-user-list-input')) {
        input.disabled = false
      }
    }
  }
})

on('user-list-form:success', '.js-follow-list', event => {
  const responseBody = event.detail
  const targetUrlElement =
    responseBody instanceof DocumentFragment ? responseBody.querySelector<HTMLAnchorElement>('.js-target-url') : null
  if (targetUrlElement?.href) {
    location.href = targetUrlElement.href
  } else {
    location.reload()
  }
})

function clearErrorsFromInput(event: Event) {
  if (!(event.currentTarget instanceof HTMLElement)) {
    return
  }

  const form = event.currentTarget.closest<HTMLFormElement>('.js-user-list-form')
  const formGroup = event.currentTarget.closest<HTMLElement>('.js-user-list-input-container')
  if (form && formGroup) {
    resetValidation(form, formGroup)
  }
}

onInput('.js-user-list-form input', clearErrorsFromInput)
onInput('.js-user-list-form textarea', clearErrorsFromInput)

on('auto-check-error', '.js-user-list-form input', function (event) {
  const formGroup = event.currentTarget.closest<HTMLElement>('.js-user-list-input-container')
  const note = formGroup?.querySelector<HTMLElement>('.js-user-list-error')
  if (note) {
    note.hidden = false
  }
})

function groupRootsByRepositoryId(roots: Iterable<HTMLElement>): Map<string, HTMLElement[]> {
  const rootsByRepositoryId = new Map<string, HTMLElement[]>()
  for (const root of roots) {
    const repositoryId = root.getAttribute('data-repository-id')
    if (repositoryId) {
      const existingRoots = rootsByRepositoryId.get(repositoryId)
      if (existingRoots) {
        existingRoots.push(root)
      } else {
        rootsByRepositoryId.set(repositoryId, [root])
      }
    }
  }
  return rootsByRepositoryId
}

async function requestMenuBatchRender(
  batchUpdateUrl: string,
  csrfToken: string,
  repositoryIds: Iterable<string>,
): Promise<Map<string, DocumentFragment>> {
  const postData = new FormData()

  // eslint-disable-next-line github/authenticity-token
  postData.set('authenticity_token', csrfToken)
  for (const repositoryId of repositoryIds) {
    postData.append('repository_ids[]', repositoryId)
  }

  const response = await fetch(batchUpdateUrl, {
    method: 'POST',
    body: postData,
    headers: {
      Accept: 'application/json',
      ...getBaseFetchHeaders(),
    },
  })

  const updatedMenuContents = new Map<string, DocumentFragment>()
  if (response.ok) {
    const json = await response.json()
    for (const key in json) {
      updatedMenuContents.set(key, parseHTML(document, json[key]))
    }
  }
  return updatedMenuContents
}

function replaceUserListMenuRoots(
  renderedMenuContents: Map<string, DocumentFragment>,
  rootsByRepositoryId: Map<string, HTMLElement[]>,
) {
  for (const [repositoryId, updatedMenu] of renderedMenuContents.entries()) {
    const matchingRoots = rootsByRepositoryId.get(repositoryId) || []
    for (const root of matchingRoots) {
      const selectPanel = root.closest<HTMLElement>('select-panel')

      root.replaceWith(matchingRoots.length === 1 ? updatedMenu : updatedMenu.cloneNode(true))

      // Update noResults visibility after DOM replacement
      if (selectPanel) {
        const noResults = selectPanel.querySelector<HTMLElement>('[data-target~="select-panel.noResults"]')
        if (noResults) {
          const hasItems = selectPanel.querySelector('[data-target~="user-list-menu.listItems"]') !== null
          noResults.hidden = hasItems
        }
      }
    }
  }
}

async function updateAllUserListMenus() {
  const roots = document.querySelectorAll<HTMLElement>('.js-user-list-menu-content-root')
  if (roots.length === 0) return

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const batchUpdateUrl = roots[0]!.getAttribute('data-batch-update-url')
  if (!batchUpdateUrl) return

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const csrfToken = roots[0]!.querySelector<HTMLInputElement>('.js-user-list-batch-update-csrf')?.value
  if (!csrfToken) return

  const rootsByRepositoryId = groupRootsByRepositoryId(roots)
  const repositoryIds = Array.from(rootsByRepositoryId.keys())

  const renderedMenuContents = await requestMenuBatchRender(batchUpdateUrl, csrfToken, repositoryIds)

  if (renderedMenuContents.size > 0) {
    replaceUserListMenuRoots(renderedMenuContents, rootsByRepositoryId)
  }
}

function requestUserListMenuFormSubmit(form: HTMLFormElement) {
  const promise = new Promise<void>((resolve, reject) => {
    form.addEventListener('user-list-menu-form:success', () => resolve())
    form.addEventListener('user-list-menu-form:error', error => reject(error))
  })
  requestSubmit(form)
  return promise
}

on('itemActivated', 'select-panel[data-target~="user-list-menu.selectPanel"]', event => {
  const panel = event.currentTarget as HTMLElement
  dirtyUserListPanels.add(panel)

  const menuRoot = panel.querySelector<HTMLElement>('.js-user-list-menu-content-root')
  const form = menuRoot?.querySelector<HTMLFormElement>('.js-user-list-menu-form')
  if (!form) return

  const dirtyFlag = form.querySelector<HTMLInputElement>('.js-user-list-menu-dirty-flag')
  if (dirtyFlag) {
    dirtyFlag.defaultValue = '0'
    dirtyFlag.value = '1'
  }
})

on('panelClosed', 'select-panel[data-target~="user-list-menu.selectPanel"]', event => {
  const panel = event.currentTarget as HTMLElement
  const menuRoot = panel.querySelector<HTMLElement>('.js-user-list-menu-content-root')
  if (!menuRoot) return

  const form = menuRoot.querySelector<HTMLFormElement>('.js-user-list-menu-form')
  if (!form) return

  if (dirtyUserListPanels.has(panel)) {
    syncSelectPanelSelectionsToForm(panel, form)
    requestSubmit(form)
    dirtyUserListPanels.delete(panel)
  }
})

onInput('.js-user-lists-menu-filter', (event: Event) => {
  const target = event.currentTarget as HTMLInputElement
  const value = target.value.trim()
  const root = target.closest('.js-user-list-menu-content-root')
  const triggerText = root?.querySelector('.js-user-list-create-trigger-text')

  if (!triggerText) return
  triggerText.textContent = value ? `"${value}"` : ''
})

remoteForm('.js-user-list-menu-form', async function (form, wants) {
  let response: SimpleResponse
  try {
    response = await wants.json()
  } catch (error) {
    showGlobalError()
    fire(form, 'user-list-menu-form:error', error)
    return
  }

  if (response.json.didStar) {
    const togglerContainer = form.closest<HTMLElement>('.js-toggler-container')
    if (togglerContainer) togglerContainer.classList.add('on')

    const starCount = response.json.starCount
    if (starCount) {
      const socialContainer = form.closest<HTMLElement>('.js-social-container')
      if (socialContainer) updateSocialCounts(socialContainer, starCount)
    }
  }

  if (response.json.didCreate) {
    await updateAllUserListMenus()
  } else {
    await updateAllUserListMenus()
  }

  fire(form, 'user-list-menu-form:success')
})

on('click', '.js-user-list-delete-confirmation-trigger', event => {
  const {currentTarget} = event
  const templateID = currentTarget.getAttribute('data-template-id')
  if (!templateID) return

  const template = document.getElementById(templateID)
  if (!template || !(template instanceof HTMLTemplateElement)) return

  const editDialog = currentTarget.closest<HTMLDetailsElement>('.js-edit-user-list-dialog')
  if (editDialog) {
    editDialog.open = false
  }
  const content = template.content.cloneNode(true)
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const labelledBy = template.getAttribute('data-labelledby')!

  dialog({content, labelledBy})
})

on('click', '.js-user-lists-create-trigger', async function (event) {
  const {currentTarget} = event
  const template = document.querySelector<HTMLTemplateElement>('.js-user-list-create-dialog-template')
  const repositoryId = event.currentTarget.getAttribute('data-repository-id')
  const userListMenuRoot = currentTarget.closest<HTMLElement>('.js-user-list-menu-content-root')
  const filter = userListMenuRoot?.querySelector<HTMLInputElement>('.js-user-lists-menu-filter')
  const placeholderName = filter?.value.trim()

  if (!template || !(template instanceof HTMLTemplateElement) || !repositoryId) {
    if (currentTarget instanceof HTMLButtonElement) {
      currentTarget.disabled = true
    }
    return
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const label = template.getAttribute('data-label')!

  const panelElement = currentTarget.closest<HTMLElement>('select-panel')
  const isPanelDirty = panelElement && dirtyUserListPanels.has(panelElement)

  if (isPanelDirty) {
    const userListMenuForm = userListMenuRoot?.querySelector<HTMLFormElement>('.js-user-list-menu-form')
    if (userListMenuForm && panelElement) {
      syncSelectPanelSelectionsToForm(panelElement, userListMenuForm)
      await requestUserListMenuFormSubmit(userListMenuForm)
      dirtyUserListPanels.delete(panelElement)
    }
  }

  const content = new TemplateInstance(template, {repositoryId, placeholderName})
  const dialogElement = await dialog({content, label})

  const selectPanel = currentTarget.closest<HTMLElement>('select-panel')

  const stableContainer = currentTarget.closest<HTMLElement>('.js-toggler-container, .js-social-container')

  dialogElement.addEventListener(
    'dialog:remove',
    () => {
      const focusRestoreTarget = stableContainer?.querySelector<HTMLElement>(
        'select-panel summary, select-panel button, select-panel [role="button"]',
      )

      if (
        focusRestoreTarget instanceof HTMLElement &&
        focusRestoreTarget.isConnected &&
        !focusRestoreTarget.closest('[hidden], [inert]') &&
        !focusRestoreTarget.matches(':disabled') &&
        focusRestoreTarget.getClientRects().length > 0
      ) {
        focusRestoreTarget.focus()
      }
    },
    {once: true},
  )

  if (selectPanel && 'hide' in selectPanel && typeof selectPanel.hide === 'function') {
    selectPanel.hide()
  }

  dialogElement.addEventListener('user-list-form:success', async formEvent => {
    const payload = (formEvent as CustomEvent).detail
    if (!(payload instanceof DocumentFragment)) return

    const urlTargetElement = payload.querySelector('.js-target-url')

    const didStar = urlTargetElement?.getAttribute('data-did-star') === 'true'
    const detailsElement = dialogElement.closest<HTMLDetailsElement>('details')

    if (!didStar) {
      if (detailsElement) detailsElement.open = false
      await updateAllUserListMenus()

      return
    }

    const togglerContainer = currentTarget.closest<HTMLElement>('.js-toggler-container')
    if (togglerContainer) togglerContainer.classList.add('on')

    const starCount = urlTargetElement?.getAttribute('data-star-count')
    if (starCount) {
      const socialContainer = currentTarget.closest<HTMLElement>('.js-social-container')
      if (socialContainer) updateSocialCounts(socialContainer, starCount)
    }

    await updateAllUserListMenus()

    if (detailsElement) detailsElement.open = false
  })
})
