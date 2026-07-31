import {attr, controller, target} from '@github/catalyst'
import type {WebauthnGetElement} from '@github-ui/webauthn-get-element'
import {State} from '@github-ui/webauthn-get-element'
import {
  initializeMobileAuthRequestStatusPoll,
  hidePromptAndShowErrorMessage as showGitHubMobileErrorState,
  resetPrompt as resetGitHubMobilePrompt,
} from '../sessions/github-mobile-two-factor'
import {supported} from '@github/webauthn-json/browser-ponyfill'
import {requestSubmit} from '@github-ui/form-utils'
import {getBaseFetchHeaders} from '@github-ui/fetch-headers'

const SudoCredentialOptionsElementState = {
  WebAuthn: 'webauthn',
  Password: 'password',
  GitHubMobile: 'github_mobile',
  TotpApp: 'app',
  TotpEmail: 'email',
} as const

type SudoCredentialOptionsElementState =
  (typeof SudoCredentialOptionsElementState)[keyof typeof SudoCredentialOptionsElementState]

@controller('sudo-credential-options')
export class SudoCredentialOptionsElement extends HTMLElement {
  static attrPrefix = ''
  @attr declare initialState: string
  @attr declare webauthnAvailable: string
  @attr declare githubMobileAvailable: string
  @attr declare totpAppAvailable: string
  @attr declare totpEmailAvailable: string
  @attr declare githubMobilePromptUrl: string
  @attr declare githubMobileGenericErrorMessage: string
  @attr declare totpEmailInitiateUrl: string
  @attr declare genericErrorMessage: string

  @target declare flashErrorMessageContainer: HTMLElement
  @target declare flashErrorMessageText: HTMLElement
  @target declare webauthnContainer: HTMLElement
  @target declare githubMobileContainer: HTMLElement
  @target declare githubMobileLoading: HTMLElement
  @target declare githubMobileLanding: HTMLElement
  @target declare totpAppContainer: HTMLElement
  @target declare totpEmailContainer: HTMLElement
  @target declare passwordContainer: HTMLElement
  @target declare githubMobileNoChallengeMessage: HTMLElement
  @target declare githubMobileChallengeMessage: HTMLElement
  @target declare githubMobileChallengeValue: HTMLElement

  @target declare webauthnNav: HTMLElement
  @target declare githubMobileNav: HTMLElement
  @target declare totpAppNav: HTMLElement
  @target declare totpEmailNav: HTMLElement
  @target declare passwordNav: HTMLElement

  @target declare webauthnGet: WebauthnGetElement
  @target declare loginField: HTMLInputElement
  @target declare passwordField: HTMLInputElement

  #currentState!: SudoCredentialOptionsElementState

  connectedCallback() {
    // set state explicitly on load to get evaluated webauthn warnings, etc
    const stateKey = this.initialState as SudoCredentialOptionsElementState
    this.#currentState = stateKey
    this.reRenderPrompt(true)
  }

  reRenderPrompt(initialLoad = false): void {
    this.resetPrompt()
    try {
      switch (this.#currentState) {
        case SudoCredentialOptionsElementState.WebAuthn:
          this.renderWebauthnOption()
          break
        case SudoCredentialOptionsElementState.GitHubMobile:
          this.renderGitHubMobileOption(initialLoad)
          break
        case SudoCredentialOptionsElementState.TotpApp:
          this.renderTotpAppOption()
          break
        case SudoCredentialOptionsElementState.TotpEmail:
          this.renderTotpEmailOption()
          break
        case SudoCredentialOptionsElementState.Password:
        default:
          this.renderPasswordOption()
          break
      }
      this.reRenderNavContainer()
    } catch (e) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      this.handleUnexpectedPromptError(e)
    }
  }

  handleUnexpectedPromptError(unexpectedError: Error) {
    let errorMessage = ''

    switch (this.#currentState) {
      case SudoCredentialOptionsElementState.GitHubMobile:
        errorMessage = this.githubMobileGenericErrorMessage
        break
      default:
        errorMessage = this.genericErrorMessage
    }

    // if we have an unexpected error, show a generic error message
    // and try the password prompt as a fallback to prevent the user from being presented with an empty prompt / no options
    if (unexpectedError && this.#currentState !== SudoCredentialOptionsElementState.Password) {
      this.renderPasswordOptionWithError(errorMessage)
      throw unexpectedError // re-throw the error so we can capture any unexpected errors with failbot/sentry
    }
  }

  renderPasswordOptionWithError(errorMessage: string): void {
    this.showPassword()
    this.showErrorMessage(errorMessage)
  }

  resetPrompt(): void {
    this.hideErrorMessage()
    if (this.isWebAuthnAvailable()) {
      this.hideWebAuthn()
    }
    if (this.isGitHubMobileAvailable()) {
      this.hideGitHubMobile()
    }
    if (this.isTotpAppAvailable()) {
      this.hideTotpApp()
    }
    if (this.isTotpEmailAvailable()) {
      this.hideTotpEmail()
    }
    this.hidePassword()
  }

  hideWebAuthn() {
    this.safeSetElementVisibility(this.webauthnContainer, false)
    this.safeSetElementVisibility(this.webauthnNav, false)
  }

  hideGitHubMobile() {
    this.safeSetElementVisibility(this.githubMobileContainer, false)
    this.safeSetElementVisibility(this.githubMobileNav, false)
    this.safeSetElementVisibility(this.githubMobileLoading, false)
    this.safeSetElementVisibility(this.githubMobileLanding, false)
  }

  hideTotpApp() {
    this.safeSetElementVisibility(this.totpAppContainer, false)
    this.safeSetElementVisibility(this.totpAppNav, false)
  }

  hideTotpEmail() {
    this.safeSetElementVisibility(this.totpEmailContainer, false)
    this.safeSetElementVisibility(this.totpEmailNav, false)
  }

  hidePassword() {
    this.safeSetElementVisibility(this.passwordContainer, false)
    this.safeSetElementVisibility(this.passwordNav, false)
  }

  reRenderNavContainer() {
    if (this.isWebAuthnAvailable() && this.#currentState !== SudoCredentialOptionsElementState.WebAuthn) {
      this.safeSetElementVisibility(this.webauthnNav, true)
    }
    if (this.isGitHubMobileAvailable() && this.#currentState !== SudoCredentialOptionsElementState.GitHubMobile) {
      this.safeSetElementVisibility(this.githubMobileNav, true)
    }
    if (this.isTotpAppAvailable() && this.#currentState !== SudoCredentialOptionsElementState.TotpApp) {
      this.safeSetElementVisibility(this.totpAppNav, true)
    }
    if (this.isTotpEmailAvailable() && this.#currentState !== SudoCredentialOptionsElementState.TotpEmail) {
      this.safeSetElementVisibility(this.totpEmailNav, true)
    }
    if (this.#currentState !== SudoCredentialOptionsElementState.Password) {
      this.safeSetElementVisibility(this.passwordNav, true)
    }
  }

  renderWebauthnOption(): void {
    this.safeSetElementVisibility(this.webauthnContainer, true)
    this.webauthnGet?.setState(supported() ? State.Ready : State.Unsupported)
  }

  renderGitHubMobileOption(initialLoad: boolean): void {
    try {
      resetGitHubMobilePrompt()
    } catch {
      // ignore errors
    }
    // if it's the initial load, show the "landing" page that
    // offers a button to initiate the GH mobile auth request
    if (initialLoad) {
      this.safeSetElementVisibility(this.githubMobileLoading, false)
      this.safeSetElementVisibility(this.githubMobileLanding, true)
      this.safeSetElementVisibility(this.githubMobileContainer, false)
    } else {
      this.safeSetElementVisibility(this.githubMobileLoading, true)
      this.safeSetElementVisibility(this.githubMobileLanding, false)
      this.safeSetElementVisibility(this.githubMobileContainer, false)
      this.initiateGitHubMobileAuthRequest()
    }
  }

  renderTotpAppOption(): void {
    this.safeSetElementVisibility(this.totpAppContainer, true)
  }

  renderTotpEmailOption(): void {
    this.safeSetElementVisibility(this.totpEmailContainer, true)
  }

  renderPasswordOption(): void {
    this.safeSetElementVisibility(this.passwordContainer, true)
    if (this.loginField) {
      this.loginField.focus()
    } else {
      this.passwordField?.focus()
    }
  }

  hasMultipleOptions(): boolean {
    return (
      this.isWebAuthnAvailable() ||
      this.isGitHubMobileAvailable() ||
      this.isTotpAppAvailable() ||
      this.isTotpEmailAvailable()
    )
  }

  isWebAuthnAvailable(): boolean {
    return this.webauthnAvailable === 'true'
  }

  isGitHubMobileAvailable(): boolean {
    return this.githubMobileAvailable === 'true'
  }

  isTotpAppAvailable(): boolean {
    return this.totpAppAvailable === 'true'
  }

  isTotpEmailAvailable(): boolean {
    return this.totpEmailAvailable === 'true'
  }

  showWebauthn(): void {
    this.#currentState = SudoCredentialOptionsElementState.WebAuthn
    this.reRenderPrompt()
  }

  showGitHubMobile(): void {
    this.#currentState = SudoCredentialOptionsElementState.GitHubMobile
    this.reRenderPrompt()
  }

  showTotpApp(): void {
    this.#currentState = SudoCredentialOptionsElementState.TotpApp
    this.reRenderPrompt()
  }

  showTotpEmail(): void {
    this.#currentState = SudoCredentialOptionsElementState.TotpEmail
    this.reRenderPrompt()
  }

  showEmailConfirm(): void {
    if (this.#currentState !== SudoCredentialOptionsElementState.TotpEmail) {
      return
    }

    const landingContainer = document.getElementById('email-landing-container')
    const sendButton = document.getElementById('sudo-send-email')
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    this.safeSetElementVisibility(landingContainer!, false)
    sendButton?.setAttribute('disabled', 'true')
    const confirmContainer = document.getElementById('email-confirm-container')
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    this.safeSetElementVisibility(confirmContainer!, true)
  }

  showPassword(): void {
    this.#currentState = SudoCredentialOptionsElementState.Password
    this.reRenderPrompt()
  }

  githubMobileRetry(e: Event): void {
    e.preventDefault()
    this.showGitHubMobile()
  }

  async initiateGitHubMobileAuthRequest(): Promise<void> {
    const url = this.githubMobilePromptUrl
    const csrfToken = (document.getElementById('sudo-credential-options-github-mobile-csrf') as HTMLInputElement).value
    const data = new FormData()
    // eslint-disable-next-line github/authenticity-token
    data.append('authenticity_token', csrfToken)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...getBaseFetchHeaders(),
        },
        body: data,
      })

      if (!response.ok && this.#currentState === SudoCredentialOptionsElementState.GitHubMobile) {
        this.mobileFailHandler(this.githubMobileGenericErrorMessage)
        return
      }

      const json = await response.json()
      const hasChallenge = !!json.challenge

      this.safeSetElementVisibility(this.githubMobileNoChallengeMessage, !hasChallenge)
      this.safeSetElementVisibility(this.githubMobileChallengeMessage, hasChallenge)
      this.safeSetElementVisibility(this.githubMobileChallengeValue, hasChallenge)

      if (hasChallenge) {
        this.githubMobileChallengeValue.textContent = json.challenge
      }

      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      const el = document.getElementsByClassName('js-poll-github-mobile-sudo-authenticate')[0]!
      initializeMobileAuthRequestStatusPoll(
        el,
        () => this.mobileApprovedHandler(),
        (message: string) => this.mobileFailHandler(message),
        () => this.mobileCancelCheck(),
      )
    } catch {
      if (this.#currentState === SudoCredentialOptionsElementState.GitHubMobile) {
        this.mobileFailHandler(this.githubMobileGenericErrorMessage)
      }
    } finally {
      if (this.#currentState === SudoCredentialOptionsElementState.GitHubMobile) {
        this.safeSetElementVisibility(this.githubMobileLoading, false)
        this.safeSetElementVisibility(this.githubMobileContainer, true)
      }
    }
  }

  mobileApprovedHandler(): void {
    if (this.#currentState === SudoCredentialOptionsElementState.GitHubMobile) {
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      const form = this.githubMobileContainer.getElementsByTagName('form')[0]!
      requestSubmit(form)
    }
  }

  mobileFailHandler(message: string): void {
    if (this.#currentState === SudoCredentialOptionsElementState.GitHubMobile) {
      this.showErrorMessage(message)
      showGitHubMobileErrorState()
    }
  }

  mobileCancelCheck(): boolean {
    return this.#currentState !== SudoCredentialOptionsElementState.GitHubMobile
  }

  async initiateTotpEmailRequest(): Promise<void> {
    const url = this.totpEmailInitiateUrl
    const csrfToken = (document.getElementById('sudo-credential-options-totp-email-csrf') as HTMLInputElement).value
    const data = new FormData()
    // eslint-disable-next-line github/authenticity-token
    data.append('authenticity_token', csrfToken)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...getBaseFetchHeaders(),
        },
        body: data,
      })

      if (!response.ok && this.#currentState === SudoCredentialOptionsElementState.TotpEmail) {
        // handle response failure
        return
      }
    } catch {
      // handle req failure
      return
    }

    this.showEmailConfirm()
  }

  safeSetElementVisibility(elem: HTMLElement, visible: boolean): boolean {
    if (elem) {
      elem.hidden = !visible
      return true
    }
    return false
  }

  showErrorMessage(message: string): void {
    if (this.flashErrorMessageText) {
      this.flashErrorMessageText.textContent = message
      this.safeSetElementVisibility(this.flashErrorMessageContainer, true)
    }
  }

  hideErrorMessage(): void {
    if (this.flashErrorMessageText) {
      this.flashErrorMessageText.textContent = ''
    }
    this.safeSetElementVisibility(this.flashErrorMessageContainer, false)
  }
}
