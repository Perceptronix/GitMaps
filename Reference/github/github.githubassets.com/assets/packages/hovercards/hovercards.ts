import {
  achievementHovercardPath,
  advisoryHovercardPath,
  commitHovercardPath,
  copilotHovercardPath,
  cweHovercardPath,
  dependabotAlertHovercardPath,
  dependencyGraphPackageHovercardPath,
  discussionHovercardPath,
  integrationHovercardPath,
  issueHovercardPath,
  issueLinkedPullRequestHovercardPath,
  orgHovercardPath,
  profileHighlightHovercardPath,
  projectHovercardPath,
  repositoryPath,
  securityAlertHovercardPath,
  sponsorsListingHovercardPath,
  teamHovercardPath,
  trackedInHovercardPath,
  trackingHovercardPath,
  userHovercardPath,
  userIdHovercardPath,
} from '@github-ui/paths'

import {HOVERCARD_KEYBOARD_SHORTCUT, isHovercardHintEnabledForUser} from './preferences'

import {isFeatureEnabled} from '@github-ui/feature-flags'

/**
 * All supported hovercard types with URL generators.
 */
export type HovercardType = keyof PossibleHovecardOptions

/**
 * Extended hovercard types that may appear in the DOM but don't have
 * URL generators in this package (legacy or server-rendered only).
 */
export type ExtendedHovercardType = HovercardType | 'acv_badge'

export type HovercardAttributes = {
  'data-hovercard-url': string
  'data-hovercard-type': HovercardType
}

export type HovercardAttributesWithTracking = HovercardAttributes & {
  'octo-click': string
  'octo-dimensions': string
}

type BaseOptions = {
  /** Include octo-click/octo-dimensions tracking attributes. Default: true */
  tracking?: boolean
}

// Type-specific option payloads
// Note: Many fields accept `undefined` to support conditional rendering patterns.
// When `undefined` is passed, `getHovercardUrl()` returns `null` and `hovercardAttributes()` returns `{}`.
type UserLoginOptions = BaseOptions & {login: string | undefined}
type UserIdOptions = BaseOptions & {userId: number | undefined}
type UserOptions = UserLoginOptions | UserIdOptions
type OrganizationOptions = BaseOptions & {login: string | undefined}
type TeamOptions = BaseOptions & {owner: string | undefined; team: string | undefined}
type IssueOptions = BaseOptions & {owner: string | undefined; repo: string | undefined; issueNumber: number | undefined}
type PullRequestOptions = BaseOptions & {
  owner: string | undefined
  repo: string | undefined
  pullRequestNumber: number | undefined
}
type CommitOptions = BaseOptions & {owner: string | undefined; repo: string | undefined; commitish: string | undefined}
type CopilotOptions = BaseOptions & {botSlug: string | undefined}
type RepositoryOptions = BaseOptions & {owner: string | undefined; repo: string | undefined}
type DiscussionOptions = BaseOptions & {
  owner: string | undefined
  repo: string | undefined
  discussionNumber: number | undefined
}
type AdvisoryOptions = BaseOptions & {ghsaId: string | undefined}
type CweOptions = BaseOptions & {id: string | undefined}
type SponsorsListingOptions = BaseOptions & {login: string | undefined}
type AchievementOptions = BaseOptions & {login: string | undefined; slug: string | undefined}
type TrackedInOptions = BaseOptions & {
  owner: string | undefined
  repo: string | undefined
  issueNumber: number | undefined
}
type TrackingOptions = BaseOptions & {
  owner: string | undefined
  repo: string | undefined
  issueNumber: number | undefined
  id: number | undefined
}
type SecurityAlertOptions = BaseOptions & {
  owner: string | undefined
  repo: string | undefined
  alertNumber: number | undefined
}
type DependabotAlertOptions = BaseOptions & {
  owner: string | undefined
  repo: string | undefined
  alertNumber: number | undefined
}
type DependencyGraphPackageOptions = BaseOptions & {
  owner: string | undefined
  repo: string | undefined
  id: string | undefined
  name: string | undefined
}
type ProjectOptions = BaseOptions & {projectId: number | undefined}
type IntegrationOptions = BaseOptions & {id: number | undefined}
type ProfileHighlightOptions = BaseOptions & {login: string | undefined; highlightType: string | undefined}

type PossibleHovecardOptions = {
  organization: OrganizationOptions
  user: UserOptions
  team: TeamOptions
  issue: IssueOptions
  pull_request: PullRequestOptions
  commit: CommitOptions
  copilot: CopilotOptions
  repository: RepositoryOptions
  discussion: DiscussionOptions
  advisory: AdvisoryOptions
  cwe: CweOptions
  sponsors_listing: SponsorsListingOptions
  achievement: AchievementOptions
  tracked_in: TrackedInOptions
  tracking: TrackingOptions
  security_alert: SecurityAlertOptions
  dependabot_alert: DependabotAlertOptions
  dependency_graph_package: DependencyGraphPackageOptions
  project: ProjectOptions
  integration: IntegrationOptions
  profile_highlight: ProfileHighlightOptions
}

/**
 * Type discriminator for hovercard options.
 */
export type HovercardOptionsFor<T extends HovercardType> = T extends keyof PossibleHovecardOptions
  ? PossibleHovecardOptions[T]
  : never

/**
 * Generate hovercard attributes for a given type using structured params.
 *
 * @example
 * ```tsx
 * // User hovercard by login
 * <a {...hovercardAttributes('user', {login: 'octocat'})} href="/octocat">@octocat</a>
 *
 * // User hovercard by ID (when login unavailable)
 * <a {...hovercardAttributes('user', {userId: 12345})} href="/octocat">@octocat</a>
 *
 * // Issue hovercard
 * <a {...hovercardAttributes('issue', {owner: 'github', repo: 'docs', issueNumber: 123})} href="/github/docs/issues/123">#123</a>
 *
 * // Commit hovercard
 * <a {...hovercardAttributes('commit', {owner: 'github', repo: 'docs', commitish: 'abc123'})} href="/github/docs/commit/abc123">abc123</a>
 *
 * // Repository hovercard
 * <a {...hovercardAttributes('repository', {owner: 'github', repo: 'docs'})} href="/github/docs">Repo</a>
 *
 * // Without tracking
 * <a {...hovercardAttributes('user', {login: 'octocat', tracking: false})} href="/octocat">@octocat</a>
 * ```
 */
export function hovercardAttributes<T extends HovercardType>(
  type: T,
  options: HovercardOptionsFor<T>,
): HovercardAttributes | HovercardAttributesWithTracking | Record<string, never> {
  const url = getHovercardUrl(type, options)
  if (!url) return {}

  const attributes: HovercardAttributes = {
    'data-hovercard-url': url,
    'data-hovercard-type': type,
  }

  const tracking = (options as BaseOptions).tracking ?? true
  if (tracking) {
    return addTrackingAttributes(attributes)
  }
  return addKeyboardHint(attributes)
}

function getHovercardUrl<T extends HovercardType>(type: T, options: HovercardOptionsFor<T>): string | null {
  switch (type) {
    case 'user': {
      const opts = options as UserLoginOptions | UserIdOptions
      if ('userId' in opts) {
        if (opts.userId == null) return null
        return userIdHovercardPath({userId: opts.userId})
      }
      if (!opts.login) return null
      return userHovercardPath({owner: opts.login})
    }
    case 'organization': {
      const opts = options as OrganizationOptions
      if (!opts.login) return null
      return orgHovercardPath({owner: opts.login})
    }
    case 'team': {
      const opts = options as TeamOptions
      if (!opts.owner || !opts.team) return null
      return teamHovercardPath({owner: opts.owner, team: opts.team})
    }
    case 'issue': {
      const opts = options as IssueOptions
      if (!opts.owner || !opts.repo || opts.issueNumber == null) return null
      return issueHovercardPath({owner: opts.owner, repo: opts.repo, issueNumber: opts.issueNumber})
    }
    case 'pull_request': {
      const opts = options as PullRequestOptions
      if (!opts.owner || !opts.repo || opts.pullRequestNumber == null) return null
      return issueLinkedPullRequestHovercardPath({
        owner: opts.owner,
        repo: opts.repo,
        pullRequestNumber: opts.pullRequestNumber,
      })
    }
    case 'commit': {
      const opts = options as CommitOptions
      if (!opts.owner || !opts.repo || !opts.commitish) return null
      return commitHovercardPath({owner: opts.owner, repo: opts.repo, commitish: opts.commitish})
    }
    case 'copilot': {
      const opts = options as CopilotOptions
      if (!opts.botSlug) return null
      return copilotHovercardPath({bot_slug: opts.botSlug})
    }
    case 'repository': {
      const opts = options as RepositoryOptions
      if (!opts.owner || !opts.repo) return null
      return repositoryPath({owner: opts.owner, repo: opts.repo, action: 'hovercard'})
    }
    case 'discussion': {
      const opts = options as DiscussionOptions
      if (!opts.owner || !opts.repo || opts.discussionNumber == null) return null
      return discussionHovercardPath({owner: opts.owner, repo: opts.repo, discussionNumber: opts.discussionNumber})
    }
    case 'advisory': {
      const opts = options as AdvisoryOptions
      if (!opts.ghsaId) return null
      return advisoryHovercardPath({ghsaId: opts.ghsaId})
    }
    case 'cwe': {
      const opts = options as CweOptions
      if (!opts.id) return null
      return cweHovercardPath({id: opts.id})
    }
    case 'sponsors_listing': {
      const opts = options as SponsorsListingOptions
      if (!opts.login) return null
      return sponsorsListingHovercardPath({login: opts.login})
    }
    case 'achievement': {
      const opts = options as AchievementOptions
      if (!opts.login || !opts.slug) return null
      return achievementHovercardPath({login: opts.login, slug: opts.slug})
    }
    case 'tracked_in': {
      const opts = options as TrackedInOptions
      if (!opts.owner || !opts.repo || opts.issueNumber == null) return null
      return trackedInHovercardPath({owner: opts.owner, repo: opts.repo, issueNumber: opts.issueNumber})
    }
    case 'tracking': {
      const opts = options as TrackingOptions
      if (!opts.owner || !opts.repo || opts.issueNumber == null || opts.id == null) return null
      return trackingHovercardPath({owner: opts.owner, repo: opts.repo, issueNumber: opts.issueNumber, id: opts.id})
    }
    case 'security_alert': {
      const opts = options as SecurityAlertOptions
      if (!opts.owner || !opts.repo || opts.alertNumber == null) return null
      return securityAlertHovercardPath({owner: opts.owner, repo: opts.repo, alertNumber: opts.alertNumber})
    }
    case 'dependabot_alert': {
      const opts = options as DependabotAlertOptions
      if (!opts.owner || !opts.repo || opts.alertNumber == null) return null
      return dependabotAlertHovercardPath({owner: opts.owner, repo: opts.repo, alertNumber: opts.alertNumber})
    }
    case 'dependency_graph_package': {
      const opts = options as DependencyGraphPackageOptions
      if (!opts.owner || !opts.repo || !opts.id || !opts.name) return null
      return dependencyGraphPackageHovercardPath({owner: opts.owner, repo: opts.repo, id: opts.id, name: opts.name})
    }
    case 'project': {
      const opts = options as ProjectOptions
      if (opts.projectId == null) return null
      return projectHovercardPath({projectId: opts.projectId})
    }
    case 'integration': {
      const opts = options as IntegrationOptions
      if (opts.id == null) return null
      return integrationHovercardPath({id: opts.id})
    }
    case 'profile_highlight': {
      const opts = options as ProfileHighlightOptions
      if (!opts.login || !opts.highlightType) return null
      return profileHighlightHovercardPath({login: opts.login, highlightType: opts.highlightType})
    }
    default: {
      const _exhaustiveCheck: never = type
      return null
    }
  }
}

function addKeyboardHint<T extends Record<string, string>>(attributes: T): T & {'aria-keyshortcuts'?: string} {
  if (isHovercardHintEnabledForUser()) {
    return {...attributes, 'aria-keyshortcuts': HOVERCARD_KEYBOARD_SHORTCUT}
  }
  return attributes
}

function addTrackingAttributes(attributes: HovercardAttributes): HovercardAttributesWithTracking {
  return addKeyboardHint({
    ...attributes,
    'octo-click': 'hovercard-link-click',
    'octo-dimensions': 'link_type:self',
  })
}

// Type metadata: aria labels and enablement selectors
type HovercardTypeConfig = {
  ariaLabel: string
  /** CSS selector for ancestor that enables this hovercard type. If undefined, always enabled. */
  enablementSelector?: string
}

const HOVERCARD_TYPE_CONFIG: Record<ExtendedHovercardType, HovercardTypeConfig> = {
  user: {ariaLabel: 'User Hovercard'},
  organization: {ariaLabel: 'Organization Hovercard'},
  copilot: {ariaLabel: 'Copilot Hovercard'},
  team: {ariaLabel: 'Team Hovercard', enablementSelector: '[data-team-hovercards-enabled]'},
  issue: {ariaLabel: 'Issue Hovercard', enablementSelector: '[data-issue-and-pr-hovercards-enabled]'},
  pull_request: {ariaLabel: 'Pull Request Hovercard', enablementSelector: '[data-issue-and-pr-hovercards-enabled]'},
  commit: {ariaLabel: 'Commit Hovercard', enablementSelector: '[data-commit-hovercards-enabled]'},
  repository: {ariaLabel: 'Repository Hovercard', enablementSelector: '[data-repository-hovercards-enabled]'},
  discussion: {ariaLabel: 'Discussion Hovercard', enablementSelector: '[data-discussion-hovercards-enabled]'},
  project: {ariaLabel: 'Project Hovercard', enablementSelector: '[data-project-hovercards-enabled]'},
  sponsors_listing: {ariaLabel: 'Sponsors Hovercard', enablementSelector: '[data-sponsors-listing-hovercards-enabled]'},
  acv_badge: {ariaLabel: 'Arctic Code Vault Badge', enablementSelector: '[data-acv-badge-hovercards-enabled]'},
  advisory: {ariaLabel: 'Advisory Hovercard'},
  cwe: {ariaLabel: 'CWE Hovercard'},
  achievement: {ariaLabel: 'Achievement Hovercard'},
  tracked_in: {ariaLabel: 'Tracked In Hovercard'},
  tracking: {ariaLabel: 'Tracking Hovercard'},
  security_alert: {ariaLabel: 'Security Alert Hovercard'},
  dependabot_alert: {ariaLabel: 'Dependabot Alert Hovercard'},
  dependency_graph_package: {ariaLabel: 'Package Hovercard'},
  integration: {ariaLabel: 'Integration Hovercard'},
  profile_highlight: {ariaLabel: 'Profile Highlight Hovercard'},
}

/**
 * Get the aria-label for a hovercard based on its type.
 * Used by the hovercard content container for screen readers.
 */
export function hovercardAriaLabelForType(hovercardType: ExtendedHovercardType | string | null): string {
  if (!hovercardType) return 'Hovercard'
  return HOVERCARD_TYPE_CONFIG[hovercardType as ExtendedHovercardType]?.ariaLabel ?? 'Hovercard'
}

/**
 * Check if hovercards are enabled for a specific type on an element.
 * Some hovercard types require an ancestor with a data attribute to be enabled.
 *
 * @param target - The element with the hovercard attributes
 * @param hovercardType - The type of hovercard (from data-hovercard-type)
 * @returns true if hovercards are enabled for this type
 */
export function isHovercardEnabledForType(
  target: Element,
  hovercardType: ExtendedHovercardType | string | null,
): boolean {
  if (!hovercardType) return true
  const selector = HOVERCARD_TYPE_CONFIG[hovercardType as ExtendedHovercardType]?.enablementSelector
  return !selector || !!target.closest(selector)
}

/**
 * Legacy helper for actor hovercards (user/copilot).
 * Prefer using hovercardAttributes('user', {login}) or hovercardAttributes('copilot', {botSlug}) directly.
 *
 * @deprecated Use hovercardAttributes('user', {login}) or hovercardAttributes('copilot', {botSlug}) instead
 */
export function hovercardAttributesForActor(
  login: string,
  {isCopilot = false, tracking = true, isAgent = false} = {},
): HovercardAttributes | HovercardAttributesWithTracking {
  if (isCopilot || isAgent) {
    const url = copilotHovercardPath({bot_slug: login})
    return tracking
      ? addTrackingAttributes(
          addKeyboardHint({
            'data-hovercard-url': url,
            'data-hovercard-type': 'copilot',
          }),
        )
      : addKeyboardHint({
          'data-hovercard-url': url,
          'data-hovercard-type': 'copilot',
        })
  } else {
    const url = userHovercardPath({owner: login})
    return tracking
      ? addTrackingAttributes(
          addKeyboardHint({
            'data-hovercard-url': url,
            'data-hovercard-type': 'user',
          }),
        )
      : addKeyboardHint({
          'data-hovercard-url': url,
          'data-hovercard-type': 'user',
        })
  }
}

function determineEnclosingSubject(target: Element): string | null {
  const tag = target.closest('[data-hovercard-subject-tag]')
  if (tag) return tag.getAttribute('data-hovercard-subject-tag')
  // Fall back to page context
  const meta = document.head && document.head.querySelector('meta[name="hovercard-subject-tag"]')
  if (meta) return meta.getAttribute('content')
  return null
}

/**
 * Get the hovercard API URL from the given target element, if it is a hovercard-enabled element. Returns an empty
 * string if the target is not hovercard-enabled or if the URL is malformed. If the URL is valid but the subject tag
 * cannot be determined, returns the URL without subject information.
 */
export function hovercardUrlFromTarget(target: Element): string {
  const baseHovercardUrl = target.getAttribute('data-hovercard-url')

  if (!baseHovercardUrl) return ''

  const subjectTag = determineEnclosingSubject(target)
  if (!subjectTag) return baseHovercardUrl

  const url = new URL(baseHovercardUrl, window.location.origin)
  const params = new URLSearchParams(url.search.slice(1))
  params.append('subject', subjectTag)
  params.append('current_path', window.location.pathname + window.location.search)

  if (isFeatureEnabled('memex_live_update_hovercard')) {
    const cacheValue = target.getAttribute('data-hovercard-cache')
    if (cacheValue) {
      params.append('hovercard_cache', cacheValue)
    }
  }

  url.search = params.toString()
  return url.toString()
}

export function getHovercardType(target: Element) {
  return target.getAttribute('data-hovercard-type')
}
