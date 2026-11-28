// Type-safe translation keys
// When you add a new key in English, TypeScript will show errors for missing keys in other languages

export interface CommonMessages {
  nav: {
    home: string;
    dashboard: string;
    team: string;
    notifications: string;
    settings: string;
    menu: string;
    selectWorkspace: string;
    profile: string;
    security: string;
    manageWorkspace: string;
    generalSettings: string;
    userManagement: string;
    billingPayments: string;
    invoices: string;
    workspace: string;
    inbox: string;
    licences: string;
    sections: {
      start: string;
      product: string;
      billing: string;
      platform: string;
    };
  };
  buttons: {
    signIn: string;
    signOut: string;
    submit: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    create: string;
    loading: string;
  };
  auth: {
    signInPrompt: string;
    signOutConfirm: string;
  };
  footer: {
    rights: string;
    tagline: string;
    sections: {
      product: string;
      resources: string;
      legal: string;
    };
    links: {
      pricing: string;
      docs: string;
      dashboard: string;
      waitlist: string;
      help: string;
      contact: string;
      feedback: string;
      about: string;
      security: string;
      gallery: string;
      agents: string;
      blog: string;
      changelog: string;
      licence: string;
      refund: string;
      privacy: string;
      terms: string;
      cookies: string;
      cookieSettings: string;
      github: string;
    };
  };
  language: {
    select: string;
    current: string;
  };
  accessibility: {
    skipToContent: string;
  };
  theme: {
    toggle: string;
    light: string;
    dark: string;
    system: string;
  };
  pages: {
    lastUpdated: string;
    draft: string;
  };
  redirecting: string;
}

export interface HomeFeature {
  badge: string;
  title: string;
  description: string;
  tryLabel: string;
}

export interface HomeMessages {
  title: string;
  hero: {
    badge: string;
    heading: string;
    description: string;
    waitlist: string;
    pricing: string;
    buy: string;
    free: string;
    faq: string;
    source: string;
    builtWith: string;
  };
  stats: {
    languages: { label: string; sublabel: string };
    tasks: { label: string; sublabel: string };
    groups: { label: string; sublabel: string };
    authCode: { label: string; sublabel: string };
  };
  cta: {
    heading: string;
    description: string;
  };
  meta: {
    title: string;
    description: string;
    tagline: string;
  };
}

export interface DashboardMessages {
  roles: {
    owner: string;
    admin: string;
    member: string;
    editor: string;
    viewer: string;
  };
  title: string;
  trial: {
    endingSoon: string;
    endingSoonMsg: string;
    upgrade: string;
    freeTrial: string;
    daysRemaining: string;
    endsOn: string;
    active: string;
    viewPlans: string;
    trialBadge: string;
  };
  noSubscription: {
    title: string;
    hint: string;
    choosePlan: string;
  };
  subscription: {
    statuses: {
      active: string;
      trialing: string;
      canceled: string;
      past_due: string;
      paused: string;
      incomplete: string;
      unpaid: string;
    };
    title: string;
    description: string;
    loading: string;
    status: string;
    activeSubscription: string;
    changePlan: string;
    noPlan: string;
    choosePlan: string;
  };
  subscriptionGates: {
    whenSubscription: {
      title: string;
      description: string;
      fallback: string;
      content: string;
    };
    whenSubscriptionToPlans: {
      title: string;
      description: string;
      fallback: string;
      content: string;
    };
  };
  seatStatus: {
    title: string;
    description: string;
    members: string;
    includedSeats: string;
    maxUsers: string;
    canInvite: string;
    yes: string;
    no: string;
    limitReached: string;
  };
  quickActionButtons: {
    inviteTeam: string;
    manageSubscription: string;
    workspaceSettings: string;
  };
  cards: {
    workspace: {
      title: string;
      empty: string;
    };
    role: {
      title: string;
      empty: string;
    };
    email: {
      title: string;
    };
    status: {
      title: string;
      active: string;
      inactive: string;
    };
  };
  quickActions: {
    title: string;
    createProject: string;
    viewReports: string;
    inviteTeam: string;
  };
  pages: {
    documents: {
      title: string;
      description: string;
      placeholder: string;
    };
    analytics: {
      title: string;
      description: string;
      placeholder: string;
    };
    team: {
      title: string;
      description: string;
      placeholder: string;
    };
    settings: {
      title: string;
      description: string;
      placeholder: string;
    };
  };
}

export interface TeamMessages {
  title: string;
  description: string;
  inviteMember: string;
  seatLimitReached: string;
  cards: {
    members: string;
    includedSeats: string;
    maxUsers: string;
    availableSeats: string;
  };
  memberList: {
    title: string;
    count: string;
    empty: string;
    roleFallback: string;
    changeRole: string;
  };
  invite: {
    title: string;
    description: string;
    noPermission: string;
    emailPlaceholder: string;
    role: string;
    send: string;
    sent: string;
    failed: string;
    resent: string;
    revoked: string;
    seatNote: string;
    pendingTitle: string;
    loading: string;
    none: string;
    invitedBy: string;
    pendingLabel: string;
    expires: string;
    cooldown: string;
    resend: string;
    revoke: string;
  };
  roleChanged: string;
  manage: {
    title: string;
    description: string;
    openSettings: string;
    permissions: string;
  };
}

export interface SettingsSectionItem {
  label: string;
  description: string;
}

export interface SettingsMessages {
  title: string;
  description: string;
  card: {
    title: string;
    description: string;
  };
  danger: {
    openButton: string;
  };
  sections: {
    profile: SettingsSectionItem;
    security: SettingsSectionItem;
    devices: SettingsSectionItem;
    'connected-agents': SettingsSectionItem;
    general: SettingsSectionItem;
    users: SettingsSectionItem;
    subscription: SettingsSectionItem;
    usage: SettingsSectionItem;
    credits: SettingsSectionItem;
    features: SettingsSectionItem;
    notifications: SettingsSectionItem;
    permissions: SettingsSectionItem;
    danger: SettingsSectionItem;
  };
}

export interface InvoicesMessages {
  title: string;
  description: string;
  refresh: string;
  billingPortal: string;
  billingPortalOpening: string;
  error: string;
  orders: {
    title: string;
    description: string;
    loading: string;
    error: string;
    empty: string;
    pricing: string;
    view: string;
    loadMore: string;
    table: {
      date: string;
      item: string;
      total: string;
      status: string;
      receipt: string;
    };
  };
  card: {
    title: string;
    found: string;
    empty: string;
  };
  table: {
    date: string;
    amount: string;
    status: string;
    description: string;
    links: string;
    view: string;
    pdf: string;
    loadMore: string;
  };
}

export interface NotificationsMessages {
  title: string;
  description: string;
  pushCard: {
    title: string;
    description: string;
    subscribed: string;
    notSubscribed: string;
    subscribe: string;
    unsubscribe: string;
  };
  sendCard: {
    title: string;
    description: string;
  };
  fields: {
    eventSlug: string;
    eventSlugHint: string;
    title: string;
    message: string;
    url: string;
    target: string;
    channel: string;
  };
  placeholders: {
    eventSlug: string;
    title: string;
    message: string;
    url: string;
  };
  buttons: {
    meOnly: string;
    allMembers: string;
    both: string;
    emailOnly: string;
    pushOnly: string;
    showAdvanced: string;
    hideAdvanced: string;
    send: string;
    sending: string;
    silent: string;
    requireInteraction: string;
    renotify: string;
    default: string;
  };
  advanced: {
    media: string;
    behavior: string;
    delivery: string;
    actions: string;
    iconUrl: string;
    imageUrl: string;
    badgeUrl: string;
    tag: string;
    tagHint: string;
    behaviorHint: string;
    urgency: string;
    ttl: string;
    schedule: string;
    action1: string;
    action2: string;
    actionTitlePlaceholder: string;
    actionKeyPlaceholder: string;
    iconUrlPlaceholder: string;
    imageUrlPlaceholder: string;
    badgeUrlPlaceholder: string;
    ttlPlaceholder: string;
  };
  context: {
    workspace: string;
    user: string;
    none: string;
  };
  resultCard: {
    title: string;
    description: string;
    openInbox: string;
  };
  toast: {
    workspaceRequired: string;
    sent: string;
    notSent: string;
    inboxHint: string;
    pushEnabled: string;
    pushDisabled: string;
    pushFailed: string;
    networkError: string;
  };
}

export interface ProfileMessages {
  agents: {
    title: string;
    description: string;
    guideTitle: string;
    guideDescription: string;
  };
  title: string;
  description: string;
  identity: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    role: string;
    id: string;
  };
  workspaceFeatures: {
    title: string;
    enabled: string;
    disabled: string;
  };
  attributes: {
    title: string;
    description: string;
    empty: string;
    setTitle: string;
    keyPlaceholder: string;
    valuePlaceholder: string;
    saving: string;
    save: string;
    saved: string;
    failed: string;
  };
  userFeatures: {
    title: string;
    description: string;
    empty: string;
    loading: string;
    enabled: string;
    disabled: string;
  };
}

export interface PricingMessages {
  title: string;
  subtitle: string;
  legal: string;
  meta: {
    title: string;
    description: string;
  };
}

export interface ErrorMessages {
  generic: {
    title: string;
    description: string;
    tryAgain: string;
    goHome: string;
  };
  notFound: {
    title: string;
    description: string;
    goBack: string;
  };
  blogNotFound: {
    title: string;
    description: string;
    browseAll: string;
  };
}

export interface BlogMessages {
  label: string;
  heading: string;
  description: string;
  noPosts: string;
  noPostsTag: string;
  noPostsCategory: string;
  noPostsAuthor: string;
  postsByAuthor: string;
  postsTaggedCount: string;
  postsInCategoryCount: string;
  readMore: string;
  read: string;
  allPosts: string;
  previous: string;
  next: string;
  pageOf: string;
  relatedPosts: string;
  share: string;
  rssLabel: string;
  shareAriaX: string;
  shareAriaLinkedin: string;
  shareAriaFacebook: string;
  shareAriaCopy: string;
  shareAriaCopied: string;
  search: {
    trigger: string;
    placeholder: string;
    searching: string;
    noResults: string;
    startTyping: string;
  };
  meta: {
    title: string;
    titlePage: string;
    description: string;
    tagTitle: string;
    tagDescription: string;
    categoryTitle: string;
    categoryDescription: string;
  };
}

export interface ChangelogMessages {
  label: string;
  heading: string;
  description: string;
  rssLabel: string;
  permalink: string;
  /** Shown when no release note is published (English only for now). */
  empty?: string;
  meta: {
    title: string;
    description: string;
  };
}

export interface InboxMessages {
  title: string;
  description: string;
  rules: {
    live: string;
    read: string;
    email: string;
  };
}

export interface HelpMessages {
  title: string;
  description: string;
  notConfigured: {
    title: string;
    token: string;
    empty: string;
  };
  from: {
    richContent: string;
    docs: string;
    faqs: string;
    testimonials: string;
  };
  docs: {
    title: string;
    empty: string;
  };
  faq: {
    title: string;
  };
  testimonials: {
    title: string;
  };
}

export interface WaitlistMessages {
  title: string;
  description: string;
  success: string;
  note: string;
}

// Combined messages type
export interface AccountMessages {
  exports: {
    csv: string;
    locked: string;
    lockedHint: string;
  };
  creditPacks: {
    title: string;
    description: string;
    credits: string;
  };
  permissions: {
    title: string;
    description: string;
    empty: string;
  };
  security: {
    title: string;
    description: string;
    sessions: {
      title: string;
      description: string;
      signOut: string;
      empty: string;
    };
    devices: {
      title: string;
      description: string;
      signOut: string;
      empty: string;
    };
    everywhere: {
      title: string;
      description: string;
      button: string;
      failed: string;
      confirmTitle: string;
      confirmBody: string;
      cancel: string;
      working: string;
    };
    passkeys: {
      title: string;
      description: string;
      button: string;
    };
    agents: {
      title: string;
      description: string;
      button: string;
    };
  };
  invitations: {
    title: string;
    description: string;
  };
  subscription: {
    cancel: string;
    canceling: string;
    resume: string;
    resuming: string;
    endsOn: string;
    canceled: string;
    resumed: string;
    failed: string;
  };
  invoice: {
    details: string;
    title: string;
    loading: string;
    missing: string;
    status: string;
    amountDue: string;
    amountPaid: string;
    created: string;
    due: string;
    note: string;
    open: string;
    pdf: string;
  };
  preferences: {
    title: string;
    description: string;
    loading: string;
    empty: string;
    failed: string;
    saved: string;
    required: string;
    requiredBadge: string;
    email: string;
    push: string;
    useDefault: string;
    refresh: string;
  };
  console: {
    title: string;
    description: string;
    workflowTemplates: {
      title: string;
      description: string;
    };
    emailLibrary: {
      title: string;
      description: string;
    };
  };
}

export interface Messages {
  common: CommonMessages;
  home: HomeMessages;
  dashboard: DashboardMessages;
  team: TeamMessages;
  settings: SettingsMessages;
  invoices: InvoicesMessages;
  notifications: NotificationsMessages;
  profile: ProfileMessages;
  pricing: PricingMessages;
  errors: ErrorMessages;
  blog: BlogMessages;
  changelog: ChangelogMessages;
  inbox: InboxMessages;
  help: HelpMessages;
  waitlist: WaitlistMessages;
  account: AccountMessages;
}

// For next-intl type inference
declare module 'next-intl' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Message files for languages that are not served (see `locales` in
 * ./config.ts). They may lag behind English; a key missing here falls back
 * to nothing, so fill every key from en.ts before serving the language.
 */
export type DraftMessages = DeepPartial<Messages>;
