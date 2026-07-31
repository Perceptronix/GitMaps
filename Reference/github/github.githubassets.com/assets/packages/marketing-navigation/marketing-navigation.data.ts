import {isFeatureEnabled} from '@github-ui/feature-flags'
import {t} from '@github-ui/swp-core/lib/utils/localization'

import {
  AiModelIcon,
  CodeIcon,
  CodescanCheckmarkIcon,
  CodespacesIcon,
  CodeSquareIcon,
  CommentDiscussionIcon,
  CopilotIcon,
  IssueOpenedIcon,
  LockIcon,
  MarkGithubIcon,
  McpIcon,
  ShieldCheckIcon,
  SparkleFillIcon,
  SponsorTiersIcon,
  StackIcon,
  WorkflowIcon,
} from '@primer/octicons-react'

import type {NavDropdownType} from './components/NavDropdown/NavDropdown'
import type {NavLinkType} from './components/NavLink/NavLink'

const PLATFORM_AI_SPARK_ITEM = {
  title: t('GitHub Spark'),
  subtitle: t('Build and deploy intelligent apps'),
  url: '/features/spark',
  icon: SparkleFillIcon,
}

const PLATFORM_AI_MODELS_ITEM = {
  title: t('GitHub Models'),
  subtitle: t('Manage and compare prompts'),
  url: '/features/models',
  icon: AiModelIcon,
}

const PLATFORM_AI_GITHUB_APP_ITEM = {
  title: t('GitHub Copilot app'),
  subtitle: t('Direct agents from issue to merge'),
  url: '/features/ai/github-app',
  icon: MarkGithubIcon,
}

const PLATFORM_CODE_QUALITY_ITEM = {
  title: t('Code Quality'),
  subtitle: t('Enforce quality at merge'),
  url: '/features/code-quality',
  icon: CodescanCheckmarkIcon,
}

function getPlatform(): NavDropdownType {
  const showGitHubApp = isFeatureEnabled('site_github_app_ga_page')
  const hideSparkAndModels = isFeatureEnabled('site_global_nav_spark_models_removed')
  const showCodeQuality = isFeatureEnabled('site_code_quality_page')

  const aiCodeCreationItems = [
    {
      title: t('GitHub Copilot'),
      subtitle: t('Write better code with AI'),
      url: '/features/copilot',
      icon: CopilotIcon,
    },
    ...(showGitHubApp ? [PLATFORM_AI_GITHUB_APP_ITEM] : []),
    ...(hideSparkAndModels ? [] : [PLATFORM_AI_SPARK_ITEM, PLATFORM_AI_MODELS_ITEM]),
    {
      title: t('MCP Registry'),
      subtitle: t('Integrate external tools'),
      url: '/mcp',
      icon: McpIcon,
    },
  ]

  const developerWorkflowsItems = [
    {
      title: t('Actions'),
      subtitle: t('Automate any workflow'),
      url: '/features/actions',
      icon: WorkflowIcon,
    },
    {
      title: t('Codespaces'),
      subtitle: t('Instant dev environments'),
      url: '/features/codespaces',
      icon: CodespacesIcon,
    },
    {
      title: t('Issues'),
      subtitle: t('Plan and track work'),
      url: '/features/issues',
      icon: IssueOpenedIcon,
    },
    {
      title: t('Code Review'),
      subtitle: t('Manage code changes'),
      url: '/features/code-review',
      icon: CodeIcon,
    },
    ...(showCodeQuality ? [PLATFORM_CODE_QUALITY_ITEM] : []),
  ]

  return {
    render: true,
    title: t('Platform'),
    trailingLink: {
      title: t('View all features'),
      url: '/features',
    },
    groups: [
      {
        title: t('AI CODE CREATION'),
        items: aiCodeCreationItems,
      },
      {
        title: t('DEVELOPER WORKFLOWS'),
        items: developerWorkflowsItems,
      },
      {
        title: t('APPLICATION SECURITY'),
        items: [
          {
            title: t('GitHub Advanced Security'),
            subtitle: t('Find and fix vulnerabilities'),
            url: '/security/advanced-security',
            icon: ShieldCheckIcon,
          },
          {
            title: t('Code security'),
            subtitle: t('Secure your code as you build'),
            url: '/security/advanced-security/code-security',
            icon: CodeSquareIcon,
          },
          {
            title: t('Secret protection'),
            subtitle: t('Stop leaks before they start'),
            url: '/security/advanced-security/secret-protection',
            icon: LockIcon,
          },
        ],
      },
      {
        title: t('EXPLORE'),
        items: [
          {
            title: t('Why GitHub'),
            url: '/why-github',
          },
          {
            title: t('Documentation'),
            url: 'https://docs.github.com',
            external: true,
          },
          {
            title: t('Blog'),
            url: 'https://github.blog',
            external: true,
          },
          {
            title: t('Changelog'),
            url: 'https://github.blog/changelog',
            external: true,
          },
          {
            title: t('Marketplace'),
            url: '/marketplace',
          },
        ],
        hasSeparator: true,
      },
    ],
  }
}

const SOLUTIONS: NavDropdownType = {
  title: t('Solutions'),
  trailingLink: {
    title: t('View all solutions'),
    url: '/solutions',
  },
  groups: [
    {
      title: t('BY COMPANY SIZE'),
      items: [
        {
          title: t('Enterprises'),
          url: '/enterprise',
        },
        {
          title: t('Small and medium teams'),
          url: '/team',
        },
        {
          title: t('Startups'),
          url: '/enterprise/startups',
        },
        {
          title: t('Nonprofits'),
          url: '/solutions/industry/nonprofits',
        },
      ],
    },
    {
      title: t('BY USE CASE'),
      items: [
        {
          title: t('App Modernization'),
          url: '/solutions/use-case/app-modernization',
        },
        {
          title: t('DevSecOps'),
          url: '/solutions/use-case/devsecops',
        },
        {
          title: t('DevOps'),
          url: '/solutions/use-case/devops',
        },
        {
          title: t('CI/CD'),
          url: '/solutions/use-case/ci-cd',
        },
        {
          title: t('View all use cases'),
          url: '/solutions/use-case',
          withArrow: true,
        },
      ],
    },
    {
      title: t('BY INDUSTRY'),
      items: [
        {
          title: t('Healthcare'),
          url: '/solutions/industry/healthcare',
        },
        {
          title: t('Financial services'),
          url: '/solutions/industry/financial-services',
        },
        {
          title: t('Manufacturing'),
          url: '/solutions/industry/manufacturing',
        },
        {
          title: t('Government'),
          url: '/solutions/industry/government',
        },
        {
          title: t('View all industries'),
          url: '/solutions/industry',
          withArrow: true,
        },
      ],
    },
  ],
}

const RESOURCES: NavDropdownType = {
  title: t('Resources'),
  trailingLink: {
    title: t('View all resources'),
    url: '/resources',
  },
  groups: [
    {
      title: t('EXPLORE BY TOPIC'),
      items: [
        {
          title: t('AI'),
          url: '/resources/articles?topic=ai',
        },
        {
          title: t('Software Development'),
          url: '/resources/articles?topic=software-development',
        },
        {
          title: t('DevOps'),
          url: '/resources/articles?topic=devops',
        },
        {
          title: t('Security'),
          url: '/resources/articles?topic=security',
        },
        {
          title: t('View all topics'),
          url: '/resources/articles',
          withArrow: true,
        },
      ],
    },
    {
      title: t('EXPLORE BY TYPE'),
      items: [
        {
          title: t('Customer stories'),
          url: '/customer-stories',
        },
        {
          title: t('Events & webinars'),
          url: '/resources/events',
        },
        {
          title: t('Ebooks & reports'),
          url: '/resources/whitepapers',
        },
        {
          title: t('Business insights'),
          url: '/solutions/executive-insights',
        },
        {
          title: t('GitHub Skills'),
          url: 'https://skills.github.com',
          external: true,
        },
      ],
    },
    {
      title: t('SUPPORT & SERVICES'),
      items: [
        {
          title: t('Documentation'),
          url: 'https://docs.github.com',
          external: true,
        },
        {
          title: t('Customer support'),
          url: 'https://support.github.com',
          external: true,
        },
        {
          title: t('Community forum'),
          url: '/orgs/community/discussions',
        },
        {
          title: t('Trust center'),
          url: '/trust-center',
        },
        {
          title: t('Partners'),
          url: '/partners',
        },
      ],
    },
  ],
}

const OPEN_SOURCE: NavDropdownType = {
  title: t('Open Source'),
  groups: [
    {
      title: t('COMMUNITY'),
      items: [
        {
          title: t('GitHub Sponsors'),
          subtitle: t('Fund open source developers'),
          url: '/open-source/sponsors',
          icon: SponsorTiersIcon,
        },
      ],
    },
    {
      title: t('PROGRAMS'),
      items: [
        {
          title: t('Security Lab'),
          url: 'https://securitylab.github.com',
          external: true,
        },
        {
          title: t('Maintainer Community'),
          url: 'https://maintainers.github.com',
          external: true,
        },
        {
          title: t('Accelerator'),
          url: '/open-source/accelerator',
        },
        {
          title: t('GitHub Stars'),
          url: 'https://stars.github.com',
          external: true,
        },
        {
          title: t('Archive Program'),
          url: 'https://archiveprogram.github.com',
          external: true,
        },
      ],
    },
    {
      title: t('REPOSITORIES'),
      items: [
        {
          title: t('Topics'),
          url: '/topics',
        },
        {
          title: t('Trending'),
          url: '/trending',
        },
        {
          title: t('Collections'),
          url: '/collections',
        },
      ],
    },
  ],
}

const ENTERPRISE: NavDropdownType = {
  title: t('Enterprise'),
  groups: [
    {
      title: t('ENTERPRISE SOLUTIONS'),
      items: [
        {
          title: t('Enterprise platform'),
          subtitle: t('AI-powered developer platform'),
          url: '/enterprise',
          icon: StackIcon,
        },
      ],
    },
    {
      title: t('AVAILABLE ADD-ONS'),
      items: [
        {
          title: t('GitHub Advanced Security'),
          subtitle: t('Enterprise-grade security features'),
          url: '/security/advanced-security',
          icon: ShieldCheckIcon,
        },
        {
          title: t('Copilot for Business'),
          subtitle: t('Enterprise-grade AI features'),
          url: '/features/copilot/copilot-business',
          icon: CopilotIcon,
        },
        {
          title: t('Premium Support'),
          subtitle: t('Enterprise-grade 24/7 support'),
          url: '/enterprise/premium-support',
          icon: CommentDiscussionIcon,
        },
      ],
    },
  ],
}

const PRICING: NavLinkType = {
  title: t('Pricing'),
  url: '/pricing',
}

// Determines order of navigation items
export function getMarketingNavigationData(): Array<NavDropdownType | NavLinkType> {
  return [getPlatform(), SOLUTIONS, RESOURCES, OPEN_SOURCE, ENTERPRISE, PRICING]
}
