import type { Messages } from '../types';

const messages: Messages = {
  common: {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      team: 'Team',
      notifications: 'Notifications',
      settings: 'Settings',
      menu: 'Menu',
      selectWorkspace: 'Select workspace',
      profile: 'Profile',
      security: 'Security',
      manageWorkspace: 'Manage Workspace',
      generalSettings: 'General Settings',
      userManagement: 'User Management',
      billingPayments: 'Billing & Payments',
      invoices: 'Invoices',
      workspace: 'Workspace',
      inbox: 'Inbox',
      licences: 'Licences',
      sections: {
        start: 'Start',
        product: 'Product',
        billing: 'Billing',
        platform: 'Platform',
      },
    },
    buttons: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      loading: 'Loading...',
    },
    auth: {
      signInPrompt: 'Please sign in to continue',
      signOutConfirm: 'Are you sure you want to sign out?',
    },
    footer: {
      rights: 'All rights reserved',
      tagline:
        'A source-available, agent-driven short-form video studio you self-host. Free for personal use; one-time commercial licence. Early access.',
      sections: {
        product: 'Product',
        resources: 'Resources',
        legal: 'Legal',
      },
      links: {
        pricing: 'Pricing',
        docs: 'Docs',
        dashboard: 'Dashboard',
        waitlist: 'Waitlist',
        help: 'Help',
        contact: 'Contact',
        blog: 'Blog',
        changelog: 'Changelog',
        licence: 'Licences',
        refund: 'Refund policy',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        github: 'Source on GitHub',
      },
    },
    language: {
      select: 'Select Language',
      current: 'Current language',
    },
    accessibility: {
      skipToContent: 'Skip to content',
    },
    theme: {
      toggle: 'Toggle theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    pages: {
      lastUpdated: 'Last updated:',
      draft: 'Draft – pending review',
    },
    redirecting: 'Redirecting...',
  },
  home: {
    title: 'ReelForge',
    hero: {
      badge: 'Early access · source-available · self-hosted',
      heading:
        'Your agent directs. <highlight>Your server renders.</highlight>',
      description:
        'A source-available, agent-driven short-form video studio. Free for personal use; one-time commercial licence. Self-host it on your own machine or a cloud server you run. Your AI agent drives it over REST and MCP (any MCP client; tested with Claude Code): it plans every scene and its timing, and ReelForge renders them with Remotion, Motion Canvas, HTML and HyperFrames into one vertical MP4.',
      waitlist: 'Join the waitlist',
      pricing: 'See pricing',
      buy: 'Buy ReelForge',
      faq: 'Read the FAQ',
      source: 'Read the source on GitHub',
      builtWith: 'Inside',
    },
    stats: {
      languages: {
        label: 'Languages',
        sublabel: 'switch with the header toggle',
      },
      tasks: {
        label: 'Rendering engines',
        sublabel: 'Remotion, Motion Canvas, HTML and HyperFrames',
      },
      groups: {
        label: 'Output',
        sublabel: '9:16 MP4 with audio',
      },
      authCode: {
        label: 'Hosted render service',
        sublabel: 'you run it yourself',
      },
    },
    cta: {
      heading: 'Want it before launch?',
      description:
        'Get the free Personal licence, or join the waitlist to hear about releases. The source and setup guide are on GitHub, for your own computer or cloud server.',
    },
    meta: {
      title: 'ReelForge: source-available video studio for AI agents',
      description:
        'Source-available, agent-driven short-form video studio. Free for personal use; one-time commercial licence. Self-host it; your AI agent drives it over REST and MCP.',
      tagline: 'Your agent directs. Your server renders.',
    },
  },
  dashboard: {
    roles: {
      owner: 'Owner',
      admin: 'Admin',
      member: 'Member',
      editor: 'Editor',
      viewer: 'Viewer',
    },
    title: 'Dashboard',
    welcome: 'Welcome back, {name}!',
    trial: {
      endingSoon: 'Trial ending soon',
      endingSoonMsg:
        'Your trial ends in {days} day{s}. Upgrade now to keep access.',
      upgrade: 'Upgrade',
      freeTrial: "You're on a free trial",
      daysRemaining: '{days} days remaining',
      endsOn: 'Trial ends {date}',
      active: 'Trial active',
      viewPlans: 'View plans',
      trialBadge: 'Trial',
    },
    noSubscription: {
      title: 'No active subscription',
      hint: 'Subscribe to unlock paid features',
      choosePlan: 'Choose a plan',
    },
    subscription: {
      statuses: {
        active: 'Active',
        trialing: 'Trialing',
        canceled: 'Canceled',
        past_due: 'Past due',
        paused: 'Paused',
        incomplete: 'Incomplete',
        unpaid: 'Unpaid',
      },
      title: 'Subscription',
      description: 'Your current plan',
      loading: 'Loading...',
      status: 'Status: {status}',
      activeSubscription: 'Active subscription',
      changePlan: 'Change plan',
      noPlan: 'No active plan',
      choosePlan: 'Choose a plan',
    },
    subscriptionGates: {
      whenSubscription: {
        title: 'Subscription gate',
        description: 'Only visible when workspace has an active subscription',
        fallback: 'No subscription active — upgrade to see this content.',
        content: 'You have an active subscription — this card is visible.',
      },
      whenSubscriptionToPlans: {
        title: 'Plan gate',
        description: 'Only visible when subscribed to a specific plan',
        fallback: 'Not on a Pro / Enterprise / Growth plan.',
        content:
          "You're on Pro, Enterprise, or Growth — premium content unlocked.",
      },
    },
    seatStatus: {
      title: 'Seat status',
      description: 'Member count vs plan limits',
      members: 'Members',
      includedSeats: 'Included seats',
      maxUsers: 'Max users',
      canInvite: 'Can invite',
      yes: 'Yes',
      no: 'No',
      limitReached:
        'Seat limit reached — upgrade your plan to invite more members.',
    },
    quickActionButtons: {
      inviteTeam: 'Invite team',
      manageSubscription: 'Manage subscription',
      workspaceSettings: 'Workspace settings',
    },
    cards: {
      workspace: {
        title: 'Current Workspace',
        empty: 'No workspace selected',
      },
      role: {
        title: 'Your Role',
        empty: 'N/A',
      },
      email: {
        title: 'Email',
      },
      status: {
        title: 'Status',
        active: 'Active',
        inactive: 'Inactive',
      },
    },
    quickActions: {
      title: 'Quick Actions',
      createProject: 'Create Project',
      viewReports: 'View Reports',
      inviteTeam: 'Invite Team Member',
    },
    pages: {
      documents: {
        title: 'Documents',
        description: 'Manage your documents',
        placeholder: 'Documents content goes here.',
      },
      analytics: {
        title: 'Analytics',
        description: 'View your analytics',
        placeholder: 'Analytics content goes here.',
      },
      team: {
        title: 'Team',
        description: 'Manage your team',
        placeholder: 'Team management content goes here.',
      },
      settings: {
        title: 'Settings',
        description: 'Manage your settings',
        placeholder: 'Settings content goes here.',
      },
    },
  },
  team: {
    title: 'Team',
    description: 'Workspace members',
    inviteMember: 'Invite member',
    seatLimitReached:
      'Seat limit reached — upgrade your plan to invite more members.',
    cards: {
      members: 'Members',
      includedSeats: 'Included seats',
      maxUsers: 'Max users',
      availableSeats: 'Available seats',
    },
    memberList: {
      title: 'Members',
      count: '{count} member(s) in this workspace',
      empty: 'No members loaded. Make sure you are authenticated.',
      roleFallback: 'member',
      changeRole: 'Change role',
    },
    invite: {
      title: 'Invite by email',
      description:
        'The address needs no account yet. They get an email, follow the link, sign up or in, and accept.',
      noPermission: 'Your role cannot invite members.',
      emailPlaceholder: 'name@company.com',
      role: 'Role',
      send: 'Send invitation',
      sent: 'Invitation sent to {email}',
      failed: 'Something went wrong',
      resent: 'Invitation sent again',
      revoked: 'Invitation revoked',
      seatNote: '{count} pending invitation(s) hold a seat until answered.',
      pendingTitle: 'Pending',
      loading: 'Loading…',
      none: 'Nothing pending.',
      invitedBy: 'Invited by {name}',
      pendingLabel: 'Pending',
      expires: 'expires {date}',
      cooldown: 'Resend available in {seconds}s',
      resend: 'Resend',
      revoke: 'Revoke',
    },
    roleChanged: 'Role changed to {role}',
    manage: {
      title: 'Manage members',
      description:
        'Open the workspace settings panel to manage roles and invitations',
      openSettings: 'Open member settings',
      permissions: 'Permissions',
    },
  },
  settings: {
    title: 'Settings',
    description: 'Workspace settings',
    card: {
      title: 'Workspace settings',
      description: 'Click any section to open the BuildBase settings panel',
    },
    danger: {
      openButton: 'Open danger zone',
    },
    sections: {
      security: {
        label: 'Security',
        description: 'Passkeys and how you sign in',
      },
      devices: {
        label: 'Devices',
        description: 'Browsers and machines you are signed in on',
      },
      'connected-agents': {
        label: 'Connected agents',
        description: 'AI agents you granted access over MCP',
      },
      profile: {
        label: 'Profile',
        description: 'Your name, avatar, and personal details',
      },
      general: {
        label: 'General',
        description: 'Workspace name, slug, and basic settings',
      },
      users: {
        label: 'Members & invitations',
        description: 'Manage team members, roles, and pending invites',
      },
      subscription: {
        label: 'Subscription',
        description: 'View and change your current plan',
      },
      usage: {
        label: 'Usage',
        description: 'Quota consumption and usage history',
      },
      credits: {
        label: 'Credits',
        description: 'Credit balance and top-up options',
      },
      features: {
        label: 'Feature flags',
        description: 'Workspace-level feature toggles',
      },
      notifications: {
        label: 'Notifications',
        description: 'Email and push notification preferences',
      },
      permissions: {
        label: 'Permissions',
        description: 'Role-based access control settings',
      },
      danger: {
        label: 'Danger zone',
        description: 'Delete workspace or transfer ownership',
      },
    },
  },
  invoices: {
    title: 'Invoices',
    description: 'Billing history',
    refresh: 'Refresh',
    billingPortal: 'Billing portal',
    billingPortalOpening: 'Opening…',
    error: 'Failed to load invoices.',
    card: {
      title: 'Invoice history',
      found: '{count} invoice(s) found',
      empty:
        'No invoices yet. Invoices appear here after you subscribe to a paid plan.',
    },
    table: {
      date: 'Date',
      amount: 'Amount',
      status: 'Status',
      description: 'Description',
      links: 'Links',
      view: 'View',
      pdf: 'PDF',
      loadMore: 'Load more',
    },
  },
  notifications: {
    title: 'Notifications',
    description: 'Send a notification from this app and watch where it lands',
    pushCard: {
      title: 'Browser Push Notifications',
      description: 'Enable browser push notifications for this device',
      subscribed: 'Subscribed',
      notSubscribed: 'Not subscribed',
      subscribe: 'Subscribe',
      unsubscribe: 'Unsubscribe',
    },
    sendCard: {
      title: 'Send Test Notification',
      description:
        "Fill in the fields below and send a notification. Merge tags like '{{name}}', '{{workspaceName}}' and '{{url}}' are resolved automatically.",
    },
    fields: {
      eventSlug: 'Event Slug',
      eventSlugHint:
        'The demo event is "{slug}", registered in the console with email and push. Any slug works for push only; email needs a registered event.',
      title: 'Title',
      message: 'Message',
      url: 'URL',
      target: 'Target',
      channel: 'Channel',
    },
    placeholders: {
      eventSlug: 'e.g. comment_added, deployment_success',
      title: 'Notification title (falls back to event name)',
      message: 'Push body + email message',
      url: 'Opens on push click',
    },
    buttons: {
      meOnly: 'Me only',
      allMembers: 'All workspace members',
      both: 'Both',
      emailOnly: 'Email only',
      pushOnly: 'Push only',
      showAdvanced: 'Show Advanced Push Options',
      hideAdvanced: 'Hide Advanced Push Options',
      send: 'Send Notification',
      sending: 'Sending...',
      silent: 'Silent',
      requireInteraction: 'Require Interaction',
      renotify: 'Renotify',
      default: 'Default',
    },
    advanced: {
      media: 'Media',
      behavior: 'Push Behavior',
      delivery: 'Delivery',
      actions: 'Action Buttons (max 2)',
      iconUrl: 'Icon URL',
      imageUrl: 'Image URL',
      badgeUrl: 'Badge URL',
      tag: 'Tag',
      tagHint: 'Replaces notification with same tag instead of stacking',
      behaviorHint:
        'Silent = no sound/vibration. Require Interaction = stays until user interacts. Renotify = sound again when replacing via tag.',
      urgency: 'Urgency',
      ttl: 'TTL (seconds)',
      schedule: 'Schedule (ISO 8601)',
      action1: 'Action 1',
      action2: 'Action 2',
      actionTitlePlaceholder: 'Button label (e.g. Reply)',
      actionKeyPlaceholder: 'Action key (e.g. reply)',
      iconUrlPlaceholder: 'Push icon (falls back to org icon)',
      imageUrlPlaceholder: 'Large image in push body',
      badgeUrlPlaceholder: 'Status bar icon (Android)',
      ttlPlaceholder: '86400 (24h default)',
    },
    context: {
      workspace: 'Workspace:',
      user: 'User:',
      none: 'None selected',
    },
    resultCard: {
      title: 'Response',
      description: 'What the platform did with the send.',
      openInbox: 'Open inbox',
    },
    toast: {
      workspaceRequired: 'Please select a workspace first',
      sent: 'Notification sent to {count} user(s)',
      notSent: 'Notification not sent: {reason}',
      inboxHint: 'Check the bell and your inbox.',
      pushEnabled: 'Push notifications enabled',
      pushDisabled: 'Push notifications disabled',
      pushFailed: 'Failed to toggle push notifications',
      networkError: 'Network error — could not reach the server',
    },
  },
  profile: {
    agents: {
      title: 'Connected agents',
      description:
        'AI clients you have authorized to act as you over MCP. Disconnect revokes their access.',
      guideTitle: 'Connect an agent',
      guideDescription:
        'This app is an MCP server. Add it to Claude, Cursor or ChatGPT and sign in with your BuildBase account; the agent then reads your workspaces and this app’s documents with your permissions.',
    },
    title: 'User Profile',
    description: 'User attributes and feature flags',
    identity: {
      title: 'Identity',
      subtitle: 'From useSaaSAuth()',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      id: 'ID',
    },
    workspaceFeatures: {
      title: 'Workspace feature flags',
      enabled: 'Enabled',
      disabled: 'Disabled',
    },
    attributes: {
      title: 'User Attributes',
      description: 'Custom key-value pairs stored per user',
      empty: 'No attributes set yet.',
      setTitle: 'Set an attribute',
      keyPlaceholder: 'key (e.g. theme)',
      valuePlaceholder: 'value',
      saving: 'Saving…',
      save: 'Save',
      saved: 'Saved!',
      failed: 'Failed to save.',
    },
    userFeatures: {
      title: 'User Feature Flags',
      description: 'User-level feature flags',
      empty: 'No feature flags configured for this user.',
      loading: 'Loading...',
      enabled: 'Enabled',
      disabled: 'Disabled',
    },
  },
  pricing: {
    title: 'Pricing',
    subtitle:
      'Free for personal use. A one-time Commercial licence for anything that earns money. Every key activates the released Docker image on your own machine or cloud server. Prices come straight from the store.',
    legal:
      'Claiming or buying a key means you accept the <licence>licence that applies</licence>. See the <refund>refund policy</refund>. Both are drafts pending review.',
    meta: {
      title: 'Pricing',
      description:
        'ReelForge is free for personal use (PolyForm Noncommercial). Commercial use needs a one-time Commercial licence: what each tier costs and includes.',
    },
  },
  errors: {
    generic: {
      title: 'Something went wrong',
      description:
        'An unexpected error occurred. Please try again or contact support if the problem persists.',
      tryAgain: 'Try again',
      goHome: 'Go to homepage',
    },
    notFound: {
      title: 'Page not found',
      description:
        "Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.",
      goBack: 'Go back',
    },
    blogNotFound: {
      title: 'Post not found',
      description:
        "The blog post you're looking for doesn't exist, may have been removed, or is not available in your language.",
      browseAll: 'Browse all posts',
    },
  },
  blog: {
    label: 'Blog',
    heading: 'Blog',
    description:
      'What we ship in ReelForge and how to run it. We only write about what exists.',
    noPosts: 'No posts yet.',
    noPostsTag: 'No posts with this tag yet.',
    noPostsCategory: 'No posts in this category yet.',
    noPostsAuthor: 'No posts by this author yet.',
    postsByAuthor: 'Posts by {name}',
    postsTaggedCount:
      '{count, plural, one {# post tagged with "{tag}"} other {# posts tagged with "{tag}"}}',
    postsInCategoryCount:
      '{count, plural, one {# post in this category} other {# posts in this category}}',
    readMore: 'Read more',
    read: 'Read',
    allPosts: '← All posts',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {page} of {total}',
    relatedPosts: 'Related posts',
    share: 'Share',
    rssLabel: 'RSS',
    shareAriaX: 'Share on X / Twitter',
    shareAriaLinkedin: 'Share on LinkedIn',
    shareAriaFacebook: 'Share on Facebook',
    shareAriaCopy: 'Copy link',
    shareAriaCopied: 'Link copied!',
    search: {
      trigger: 'Search posts...',
      placeholder: 'Search blog posts...',
      searching: 'Searching...',
      noResults: 'No results for "{query}"',
      startTyping: 'Start typing to search...',
    },
    meta: {
      title: 'Blog',
      titlePage: 'Blog, page {page}',
      description:
        'Announcements and guides from the people building ReelForge, a self-hosted studio your AI agent drives.',
      tagTitle: 'Posts tagged "{tag}"',
      tagDescription: 'All blog posts tagged with "{tag}".',
      categoryTitle: '{category} — Blog',
      categoryDescription: 'Blog posts in the "{category}" category.',
    },
  },
  changelog: {
    label: 'Changelog',
    heading: 'Changelog',
    description: 'Release notes for the ReelForge store and the product.',
    rssLabel: 'RSS',
    permalink: 'Permalink',
    meta: {
      title: 'Changelog',
      description: 'Release notes for the ReelForge store and the product.',
    },
  },
  inbox: {
    title: 'Inbox',
    description:
      'Everything this app has sent you, one item per notification, however it was delivered.',
    rules: {
      live: 'New items arrive live over a socket; no reload.',
      read: 'An item is read when you open it here or click its link. Opening the email alone does not read it.',
      email:
        'Each item shows what email and push did, so you can see why a channel stayed quiet.',
    },
  },
  help: {
    title: 'Help',
    description:
      'Answers to common questions about ReelForge and this store. Installation guides will be published here when ReelForge is released.',
    notConfigured: {
      title: 'Guides are on the way',
      token:
        'Installation and setup guides will appear here when ReelForge is released.',
      empty:
        'Installation and setup guides will appear here when ReelForge is released.',
    },
    from: {
      richContent: 'rich content',
      docs: 'docs',
      faqs: 'faq collection',
      testimonials: 'testimonials',
    },
    docs: {
      title: 'Documentation',
      empty: 'No published docs yet.',
    },
    faq: {
      title: 'Frequently asked',
    },
    testimonials: {
      title: 'What customers say',
    },
  },
  waitlist: {
    title: 'Join the ReelForge waitlist',
    description:
      'ReelForge is not on sale yet. Leave your name and email and we will tell you when it is, with what it costs and what you get.',
    success:
      'You are on the list. We will email you when ReelForge can be bought.',
    note: 'We use your email only to tell you about ReelForge availability. See the privacy policy.',
  },
  account: {
    exports: {
      csv: 'Export CSV',
      locked: 'Export',
      lockedHint:
        'Exports are part of a paid plan. Choose a plan to unlock them.',
    },
    creditPacks: {
      title: 'Credit packs',
      description:
        'Top up any plan. Credits pay for document creation and AI actions.',
      credits: '{count} credits',
    },
    permissions: {
      title: "Your organization's permissions",
      description:
        'Keys defined in the BuildBase console and granted per role, custom roles included. Documents checks these on the server too.',
      empty:
        'This organization has not defined its own permissions yet. Run npm run seed:org, or add keys in the console under Workspace settings → Permissions.',
    },
    security: {
      title: 'Security',
      description:
        'Every place you are signed in, the devices you trust, and the ways to end them.',
      sessions: {
        title: 'Sessions',
        description:
          'Each sign-in is a session on the platform. Sign one out and it stops working everywhere, at once.',
        signOut: 'Sign out',
        empty: 'No other sessions.',
      },
      devices: {
        title: 'Devices',
        description:
          'Browsers and machines you have signed in from. A trusted device skips extra checks.',
        signOut: 'Sign out',
        empty: 'No devices yet.',
      },
      everywhere: {
        title: 'Sign out everywhere',
        description:
          'Ends every session you have, on every device, including this one.',
        button: 'Sign out everywhere',
        failed: 'Could not sign out everywhere. Try again.',
        confirmTitle: 'Sign out of every device?',
        confirmBody:
          'Every session ends now, on every device, and you will need to sign in again here too.',
        cancel: 'Cancel',
        working: 'Signing out…',
      },
      passkeys: {
        title: 'Passkeys',
        description:
          'Sign in with a fingerprint, face or device PIN. Passkeys register on the hosted sign-in domain, so this opens the SDK screen for it.',
        button: 'Manage passkeys',
      },
      agents: {
        title: 'Connected agents',
        description:
          'AI agents you granted access over MCP. Review and revoke them on your profile.',
        button: 'Open profile',
      },
    },
    invitations: {
      title: 'Invitations waiting for you',
      description:
        'Workspaces that invited you. Accepting switches you to the workspace.',
    },
    subscription: {
      cancel: 'Cancel plan',
      canceling: 'Canceling…',
      resume: 'Keep plan',
      resuming: 'Resuming…',
      endsOn: 'Ends on {date}',
      canceled: 'The plan ends at the end of this period.',
      resumed: 'The plan continues.',
      failed: 'That did not work. Try again.',
    },
    invoice: {
      details: 'Details',
      title: 'Invoice {number}',
      loading: 'Loading the invoice…',
      missing: 'Invoice not found.',
      status: 'Status',
      amountDue: 'Amount due',
      amountPaid: 'Amount paid',
      created: 'Issued',
      due: 'Due',
      note: 'Note',
      open: 'Open hosted invoice',
      pdf: 'Download PDF',
    },
    preferences: {
      title: 'Your notification preferences',
      description:
        'Choose, per event, whether it reaches you by email or push. Anything you leave alone follows the workspace default.',
      loading: 'Loading your preferences…',
      empty:
        'This workspace has no notification events yet. Send one below and it appears here.',
      failed: 'Your preferences could not be saved.',
      saved: 'Preference saved.',
      required:
        'This event is required in this workspace and cannot be turned off.',
      requiredBadge: 'Required',
      email: 'Email',
      push: 'Push',
      useDefault: 'Use the workspace default',
      refresh: 'Refresh',
    },
    console: {
      title: 'Start from a template',
      description:
        'Ready-made sets in the BuildBase console. Clone one and it lands in your organization, filled in.',
      workflowTemplates: {
        title: 'Workflow templates',
        description:
          'Ten workflows: trial ending, payment failed, form to webhook, CRM sync and more.',
      },
      emailLibrary: {
        title: 'Email template library',
        description: 'More than a hundred email templates, free on every plan.',
      },
    },
  },
};

export default messages;
