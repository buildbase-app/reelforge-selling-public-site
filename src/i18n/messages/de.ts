// Not served: English only for now (src/i18n/config.ts). Starter demo copy;
// translate from en.ts before adding this locale back.
import type { DraftMessages } from '../types';

const messages: DraftMessages = {
  common: {
    nav: {
      home: 'Startseite',
      dashboard: 'Dashboard',
      team: 'Team',
      notifications: 'Benachrichtigungen',
      settings: 'Einstellungen',
      menu: 'Menü',
      selectWorkspace: 'Arbeitsbereich wählen',
      profile: 'Profil',
      security: 'Sicherheit',
      manageWorkspace: 'Arbeitsbereich verwalten',
      generalSettings: 'Allgemeine Einstellungen',
      userManagement: 'Benutzerverwaltung',
      billingPayments: 'Abrechnung & Zahlungen',
      invoices: 'Rechnungen',
      workspace: 'Arbeitsbereich',
      inbox: 'Posteingang',
      sections: {
        start: 'Start',
        product: 'Produkt',
        billing: 'Abrechnung',
        platform: 'Plattform',
      },
    },
    buttons: {
      signIn: 'Anmelden',
      signOut: 'Abmelden',
      submit: 'Absenden',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      loading: 'Wird geladen...',
    },
    auth: {
      signInPrompt: 'Bitte melden Sie sich an, um fortzufahren',
      signOutConfirm: 'Möchten Sie sich wirklich abmelden?',
    },
    footer: {
      rights: 'Alle Rechte vorbehalten',
      tagline:
        'Eine Live-Demo-App, die das BuildBase SDK in Aktion zeigt. Melde dich an, um Authentifizierung, Workspaces, Credits, Push-Benachrichtigungen und i18n zu erkunden.',
      sections: {
        product: 'Produkt',
        resources: 'Ressourcen',
        legal: 'Rechtliches',
      },
      links: {
        pricing: 'Preise',
        dashboard: 'Dashboard',
        blog: 'Blog',
        changelog: 'Änderungsprotokoll',
        privacy: 'Datenschutzrichtlinie',
        terms: 'Nutzungsbedingungen',
      },
    },
    language: {
      select: 'Sprache wählen',
      current: 'Aktuelle Sprache',
    },
    accessibility: {
      skipToContent: 'Zum Inhalt springen',
    },
    theme: {
      toggle: 'Design wechseln',
      light: 'Hell',
      dark: 'Dunkel',
      system: 'System',
    },
    pages: {
      lastUpdated: 'Zuletzt aktualisiert:',
    },
    redirecting: 'Weiterleitung...',
  },
  home: {
    title: 'BuildBase Demo',
    hero: {
      badge: 'Live-Demo · 67 Aufgaben',
      heading:
        'Jede BuildBase-Fähigkeit, <highlight>eine Aufgabe nach der anderen</highlight>',
      description:
        'Eine echte App auf dem BuildBase SDK, mit geführter Tour: anmelden und Registrierung, Workspaces, Abrechnung, Nutzung, Credits, Benachrichtigungen, Agenten und Webhooks durchgehen, jeweils mit Herkunft.',
      builtWith: 'Erstellt mit',
    },
    stats: {
      languages: {
        label: 'Sprachen in dieser Demo',
        sublabel: 'mit dem Header-Schalter wechseln',
      },
      tasks: {
        label: 'Aufgaben der Tour',
        sublabel: 'jede eine Fähigkeit zum Ausprobieren',
      },
      groups: {
        label: 'Gruppen',
        sublabel: 'von der Anmeldung bis zu Webhooks',
      },
      authCode: {
        label: 'Zeilen Auth-Code',
        sublabel: 'das SDK erledigt alles',
      },
    },
    cta: {
      heading: 'Bereit, alles in Aktion zu sehen?',
      description:
        'Melde dich an, um das vollständige Dashboard zu öffnen — wechsle Arbeitsbereiche, verbrauche Guthaben, sende eine Push-Benachrichtigung und schalte zwischen allen 8 Sprachen.',
    },
    meta: {
      title: 'Meine App',
      description: 'Meine Next.js-App mit shadcn/ui und Theme-Unterstützung',
      tagline: 'Baue etwas Großartiges',
    },
  },
  dashboard: {
    roles: {
      owner: 'Inhaber',
      admin: 'Administrator',
      member: 'Mitglied',
      editor: 'Bearbeiter',
      viewer: 'Betrachter',
    },
    title: 'Dashboard',
    welcome: 'Willkommen zurück, {name}!',
    trial: {
      endingSoon: 'Testphase endet bald',
      endingSoonMsg:
        'Ihre Testphase endet in {days} Tag{s}. Führen Sie jetzt ein Upgrade durch, um den Zugang zu behalten.',
      upgrade: 'Upgrade',
      freeTrial: 'Sie befinden sich in der Testphase',
      daysRemaining: '{days} Tage verbleibend',
      endsOn: 'Testphase endet am {date}',
      active: 'Testphase aktiv',
      viewPlans: 'Pläne ansehen',
      trialBadge: 'Test',
    },
    noSubscription: {
      title: 'Kein aktives Abonnement',
      hint: 'Abonnieren Sie, um kostenpflichtige Funktionen freizuschalten',
      choosePlan: 'Plan wählen',
    },
    subscription: {
      statuses: {
        active: 'Aktiv',
        trialing: 'Testphase',
        canceled: 'Gekündigt',
        past_due: 'Zahlung überfällig',
        paused: 'Pausiert',
        incomplete: 'Unvollständig',
        unpaid: 'Unbezahlt',
      },
      title: 'Abonnement',
      description: 'Ihr aktueller Plan',
      loading: 'Wird geladen...',
      status: 'Status: {status}',
      activeSubscription: 'Aktives Abonnement',
      changePlan: 'Plan wechseln',
      noPlan: 'Kein aktiver Plan',
      choosePlan: 'Plan wählen',
    },
    subscriptionGates: {
      whenSubscription: {
        title: 'Abonnement-Gate',
        description: 'Nur mit aktivem Abonnement sichtbar',
        fallback:
          'Kein aktives Abonnement — führen Sie ein Upgrade durch, um diesen Inhalt zu sehen.',
        content: 'Sie haben ein aktives Abonnement — diese Karte ist sichtbar.',
      },
      whenSubscriptionToPlans: {
        title: 'Plan-Gate',
        description: 'Nur mit einem bestimmten Plan sichtbar',
        fallback: 'Sie befinden sich nicht im Pro / Enterprise / Growth-Plan.',
        content:
          'Sie sind bei Pro, Enterprise oder Growth — Premium-Inhalt freigeschaltet.',
      },
    },
    seatStatus: {
      title: 'Sitzstatus',
      description: 'Mitglieder vs. Planlimits',
      members: 'Mitglieder',
      includedSeats: 'Enthaltene Sitze',
      maxUsers: 'Max. Benutzer',
      canInvite: 'Kann einladen',
      yes: 'Ja',
      no: 'Nein',
      limitReached:
        'Sitzlimit erreicht — führen Sie ein Upgrade durch, um mehr Mitglieder einzuladen.',
    },
    quickActionButtons: {
      inviteTeam: 'Team einladen',
      manageSubscription: 'Abonnement verwalten',
      workspaceSettings: 'Arbeitsbereich-Einstellungen',
    },
    cards: {
      workspace: {
        title: 'Aktueller Arbeitsbereich',
        empty: 'Kein Arbeitsbereich ausgewählt',
      },
      role: {
        title: 'Ihre Rolle',
        empty: 'N/A',
      },
      email: {
        title: 'E-Mail-Adresse',
      },
      status: {
        title: 'Status',
        active: 'Aktiv',
        inactive: 'Inaktiv',
      },
    },
    quickActions: {
      title: 'Schnellaktionen',
      createProject: 'Projekt erstellen',
      viewReports: 'Berichte ansehen',
      inviteTeam: 'Teammitglied einladen',
    },
    pages: {
      documents: {
        title: 'Dokumente',
        description: 'Ihre Dokumente verwalten',
        placeholder: 'Dokumenteninhalt kommt hier.',
      },
      analytics: {
        title: 'Analysen',
        description: 'Ihre Analysen ansehen',
        placeholder: 'Analyseninhalt kommt hier.',
      },
      team: {
        title: 'Team',
        description: 'Ihr Team verwalten',
        placeholder: 'Teamverwaltungsinhalt kommt hier.',
      },
      settings: {
        title: 'Einstellungen',
        description: 'Ihre Einstellungen verwalten',
        placeholder: 'Einstellungsinhalt kommt hier.',
      },
    },
  },
  team: {
    title: 'Team',
    description: 'Mitglieder des Arbeitsbereichs',
    inviteMember: 'Mitglied einladen',
    seatLimitReached:
      'Sitzlimit erreicht — führen Sie ein Upgrade durch, um mehr Mitglieder einzuladen.',
    cards: {
      members: 'Mitglieder',
      includedSeats: 'Enthaltene Sitze',
      maxUsers: 'Max. Benutzer',
      availableSeats: 'Verfügbare Sitze',
    },
    memberList: {
      title: 'Mitglieder',
      count: '{count} Mitglied(er) in diesem Arbeitsbereich',
      empty:
        'Keine Mitglieder geladen. Stellen Sie sicher, dass Sie authentifiziert sind.',
      roleFallback: 'Mitglied',
      changeRole: 'Rolle ändern',
    },
    invite: {
      title: 'Per E-Mail einladen',
      description:
        'Die Adresse braucht noch kein Konto. Die Person erhält eine E-Mail, folgt dem Link, registriert sich oder meldet sich an und nimmt an.',
      noPermission: 'Ihre Rolle darf keine Mitglieder einladen.',
      emailPlaceholder: 'name@firma.de',
      role: 'Rolle',
      send: 'Einladung senden',
      sent: 'Einladung an {email} gesendet',
      failed: 'Etwas ist schiefgelaufen',
      resent: 'Einladung erneut gesendet',
      revoked: 'Einladung zurückgezogen',
      seatNote:
        '{count} offene Einladung(en) belegen einen Platz, bis sie beantwortet sind.',
      pendingTitle: 'Offen',
      loading: 'Wird geladen…',
      none: 'Nichts offen.',
      invitedBy: 'Eingeladen von {name}',
      pendingLabel: 'Offen',
      expires: 'läuft ab am {date}',
      cooldown: 'Erneut senden in {seconds}s',
      resend: 'Erneut senden',
      revoke: 'Zurückziehen',
    },
    roleChanged: 'Rolle geändert zu {role}',
    manage: {
      title: 'Mitglieder verwalten',
      description:
        'Öffnen Sie das Einstellungspanel, um Rollen und Einladungen zu verwalten',
      openSettings: 'Mitgliedereinstellungen öffnen',
      permissions: 'Berechtigungen',
    },
  },
  settings: {
    title: 'Einstellungen',
    description: 'Konfiguration des Arbeitsbereichs',
    card: {
      title: 'Arbeitsbereich-Einstellungen',
      description:
        'Klicken Sie auf einen Abschnitt, um das Einstellungspanel zu öffnen',
    },
    danger: {
      openButton: 'Gefahrenzone öffnen',
    },
    sections: {
      security: {
        label: 'Sicherheit',
        description: 'Passkeys und wie du dich anmeldest',
      },
      devices: {
        label: 'Geräte',
        description: 'Browser und Rechner, auf denen du angemeldet bist',
      },
      'connected-agents': {
        label: 'Verbundene Agenten',
        description: 'KI-Agenten mit Zugriff über MCP',
      },
      profile: {
        label: 'Profil',
        description: 'Ihr Name, Avatar und persönliche Daten',
      },
      general: {
        label: 'Allgemein',
        description: 'Arbeitsbereichsname, Slug und grundlegende Konfiguration',
      },
      users: {
        label: 'Mitglieder & Einladungen',
        description:
          'Teammitglieder, Rollen und ausstehende Einladungen verwalten',
      },
      subscription: {
        label: 'Abonnement',
        description: 'Ihren aktuellen Plan anzeigen und ändern',
      },
      usage: {
        label: 'Nutzung',
        description: 'Kontingentverbrauch und Nutzungsverlauf',
      },
      credits: {
        label: 'Credits',
        description: 'Credit-Guthaben und Aufladoptionen',
      },
      features: {
        label: 'Feature-Flags',
        description: 'Arbeitsbereichsfunktionen aktivieren/deaktivieren',
      },
      notifications: {
        label: 'Benachrichtigungen',
        description: 'E-Mail- und Push-Benachrichtigungseinstellungen',
      },
      permissions: {
        label: 'Berechtigungen',
        description: 'Rollenbasierte Zugriffskontrolle konfigurieren',
      },
      danger: {
        label: 'Gefahrenzone',
        description: 'Arbeitsbereich löschen oder Eigentumsübertragung',
      },
    },
  },
  invoices: {
    title: 'Rechnungen',
    description: 'Abrechnungsverlauf',
    refresh: 'Aktualisieren',
    billingPortal: 'Abrechnungsportal',
    billingPortalOpening: 'Wird geöffnet…',
    error: 'Fehler beim Laden der Rechnungen.',
    card: {
      title: 'Rechnungsverlauf',
      found: '{count} Rechnung(en) gefunden',
      empty:
        'Noch keine Rechnungen. Rechnungen erscheinen hier nach dem Abonnieren eines kostenpflichtigen Plans.',
    },
    table: {
      date: 'Datum',
      amount: 'Betrag',
      status: 'Status',
      description: 'Beschreibung',
      links: 'Links',
      view: 'Ansehen',
      pdf: 'PDF',
      loadMore: 'Mehr laden',
    },
  },
  notifications: {
    title: 'Benachrichtigungen',
    description:
      'Senden Sie eine Benachrichtigung aus dieser App und sehen Sie, wo sie ankommt',
    pushCard: {
      title: 'Browser-Push-Benachrichtigungen',
      description:
        'Push-Benachrichtigungen des Browsers für dieses Gerät aktivieren',
      subscribed: 'Abonniert',
      notSubscribed: 'Nicht abonniert',
      subscribe: 'Abonnieren',
      unsubscribe: 'Abbestellen',
    },
    sendCard: {
      title: 'Testbenachrichtigung senden',
      description:
        'Füllen Sie die Felder aus und senden Sie eine Benachrichtigung. Die Labels {{name}}, {{workspaceName}}, {{url}} werden automatisch aufgelöst.',
    },
    fields: {
      eventSlug: 'Ereignis-Slug',
      eventSlugHint:
        'Das Demo-Ereignis ist „{slug}“, in der Konsole mit E-Mail und Push registriert. Nur für Push geht jeder Slug; E-Mail braucht ein registriertes Ereignis.',
      title: 'Titel',
      message: 'Nachricht',
      url: 'URL',
      target: 'Empfänger',
      channel: 'Kanal',
    },
    placeholders: {
      eventSlug: 'z.B. comment_added, deployment_success',
      title: 'Benachrichtigungstitel',
      message: 'Push-Inhalt + E-Mail-Nachricht',
      url: 'Öffnet beim Klicken auf Push',
    },
    buttons: {
      meOnly: 'Nur ich',
      allMembers: 'Alle Workspace-Mitglieder',
      both: 'Beide',
      emailOnly: 'Nur E-Mail',
      pushOnly: 'Nur Push',
      showAdvanced: 'Erweiterte Push-Optionen anzeigen',
      hideAdvanced: 'Erweiterte Push-Optionen ausblenden',
      send: 'Benachrichtigung senden',
      sending: 'Wird gesendet...',
      silent: 'Lautlos',
      requireInteraction: 'Interaktion erforderlich',
      renotify: 'Erneut benachrichtigen',
      default: 'Standard',
    },
    advanced: {
      media: 'Medien',
      behavior: 'Push-Verhalten',
      delivery: 'Zustellung',
      actions: 'Aktionsschaltflächen (max. 2)',
      iconUrl: 'Symbol-URL',
      imageUrl: 'Bild-URL',
      badgeUrl: 'Badge-URL',
      tag: 'Tag',
      tagHint:
        'Ersetzt die Benachrichtigung mit demselben Tag anstatt zu stapeln',
      behaviorHint:
        'Lautlos = kein Ton. Interaktion erforderlich = bleibt bis Benutzeraktion. Erneut benachrichtigen = Ton beim Ersetzen.',
      urgency: 'Dringlichkeit',
      ttl: 'TTL (Sekunden)',
      schedule: 'Planen (ISO 8601)',
      action1: 'Aktion 1',
      action2: 'Aktion 2',
      actionTitlePlaceholder: 'Schaltflächenbeschriftung (z.B. Antworten)',
      actionKeyPlaceholder: 'Aktionsschlüssel (z.B. reply)',
      iconUrlPlaceholder: 'Push icon (falls back to org icon)',
      imageUrlPlaceholder: 'Large image in push body',
      badgeUrlPlaceholder: 'Status bar icon (Android)',
      ttlPlaceholder: '86400 (24h default)',
    },
    context: {
      workspace: 'Arbeitsbereich:',
      user: 'Benutzer:',
      none: 'Keine Auswahl',
    },
    resultCard: {
      title: 'Antwort',
      description: 'Was die Plattform mit dem Versand gemacht hat.',
      openInbox: 'Posteingang öffnen',
    },
    toast: {
      workspaceRequired: 'Bitte wählen Sie zuerst einen Arbeitsbereich aus',
      sent: 'Benachrichtigung an {count} Benutzer gesendet',
      notSent: 'Benachrichtigung nicht gesendet: {reason}',
      inboxHint: 'Sehen Sie auf die Glocke und in Ihren Posteingang.',
      pushEnabled: 'Push-Benachrichtigungen aktiviert',
      pushDisabled: 'Push-Benachrichtigungen deaktiviert',
      pushFailed: 'Fehler beim Ändern der Push-Benachrichtigungen',
      networkError: 'Netzwerkfehler — Verbindung zum Server nicht möglich',
    },
  },
  profile: {
    agents: {
      title: 'Verbundene Agenten',
      description:
        'KI-Clients, die Sie berechtigt haben, über MCP in Ihrem Namen zu handeln. Trennen entzieht den Zugriff.',
      guideTitle: 'Agent verbinden',
      guideDescription:
        'Diese App ist ein MCP-Server. Fügen Sie sie in Claude, Cursor oder ChatGPT hinzu und melden Sie sich mit Ihrem BuildBase-Konto an; der Agent liest dann Ihre Arbeitsbereiche und die Dokumente dieser App mit Ihren Berechtigungen.',
    },
    title: 'Benutzerprofil',
    description: 'Benutzerattribute und Feature-Flags',
    identity: {
      title: 'Identität',
      subtitle: 'Von useSaaSAuth()',
      name: 'Name',
      email: 'E-Mail-Adresse',
      role: 'Rolle',
      id: 'ID',
    },
    workspaceFeatures: {
      title: 'Arbeitsbereich-Feature-Flags',
      enabled: 'Aktiviert',
      disabled: 'Deaktiviert',
    },
    attributes: {
      title: 'Benutzerattribute',
      description: 'Benutzerdefinierte Schlüssel-Wert-Paare pro Benutzer',
      empty: 'Noch keine Attribute konfiguriert.',
      setTitle: 'Attribut setzen (Demo)',
      keyPlaceholder: 'Schlüssel (z.B. theme)',
      valuePlaceholder: 'Wert',
      saving: 'Wird gespeichert…',
      save: 'Speichern',
      saved: 'Gespeichert!',
      failed: 'Speichern fehlgeschlagen.',
    },
    userFeatures: {
      title: 'Benutzer-Feature-Flags',
      description: 'Feature-Flags auf Benutzerebene',
      empty: 'Keine Flags für diesen Benutzer konfiguriert.',
      loading: 'Wird geladen...',
      enabled: 'Aktiviert',
      disabled: 'Deaktiviert',
    },
  },
  pricing: {
    title: 'Preise',
    subtitle: 'Wählen Sie den Plan, der zu Ihren Bedürfnissen passt',
    meta: {
      title: 'Preise',
      description: 'Unsere Pläne und Preise ansehen',
    },
  },
  errors: {
    generic: {
      title: 'Etwas ist schiefgelaufen',
      description:
        'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support, wenn das Problem anhält.',
      tryAgain: 'Erneut versuchen',
      goHome: 'Zur Startseite',
    },
    notFound: {
      title: 'Seite nicht gefunden',
      description:
        'Leider konnten wir die gesuchte Seite nicht finden. Sie wurde möglicherweise verschoben oder gelöscht.',
      goBack: 'Zurück',
    },
    blogNotFound: {
      title: 'Beitrag nicht gefunden',
      description:
        'Der gesuchte Blogbeitrag existiert nicht, wurde möglicherweise entfernt oder ist in Ihrer Sprache nicht verfügbar.',
      browseAll: 'Alle Beiträge anzeigen',
    },
  },
  blog: {
    label: 'Blog',
    heading: 'Neueste Beiträge',
    description: 'Updates, Tutorials und Einblicke von unserem Team.',
    noPosts: 'Noch keine Beiträge. Schauen Sie bald wieder vorbei!',
    noPostsTag: 'Noch keine Beiträge mit diesem Tag.',
    noPostsCategory: 'Noch keine Beiträge in dieser Kategorie.',
    noPostsAuthor: 'Noch keine Beiträge von diesem Autor.',
    postsByAuthor: 'Beiträge von {name}',
    postsTaggedCount:
      '{count, plural, one {# Beitrag mit dem Tag „{tag}"} other {# Beiträge mit dem Tag „{tag}"}}',
    postsInCategoryCount:
      '{count, plural, one {# Beitrag in dieser Kategorie} other {# Beiträge in dieser Kategorie}}',
    readMore: 'Mehr lesen',
    read: 'Lesen',
    allPosts: '← Alle Beiträge',
    previous: 'Zurück',
    next: 'Weiter',
    pageOf: 'Seite {page} von {total}',
    relatedPosts: 'Ähnliche Beiträge',
    share: 'Teilen',
    rssLabel: 'RSS-Feed',
    shareAriaX: 'Auf X / Twitter teilen',
    shareAriaLinkedin: 'Auf LinkedIn teilen',
    shareAriaFacebook: 'Auf Facebook teilen',
    shareAriaCopy: 'Link kopieren',
    shareAriaCopied: 'Link kopiert!',
    search: {
      trigger: 'Beiträge suchen...',
      placeholder: 'Blog durchsuchen...',
      searching: 'Suche läuft...',
      noResults: 'Keine Ergebnisse für „{query}"',
      startTyping: 'Tippen Sie, um zu suchen...',
    },
    meta: {
      title: 'Blog',
      titlePage: 'Blog — Seite {page}',
      description: 'Neueste Beiträge, Tutorials und Updates von unserem Team.',
      tagTitle: 'Beiträge mit Tag „{tag}"',
      tagDescription: 'Alle Blog-Beiträge mit dem Tag „{tag}".',
      categoryTitle: '{category} — Blog',
      categoryDescription: 'Blog-Beiträge in der Kategorie „{category}".',
    },
  },
  changelog: {
    label: 'Änderungsprotokoll',
    heading: 'Was ist neu',
    description: 'Alle neuesten Updates, Verbesserungen und Korrekturen.',
    rssLabel: 'RSS-Feed',
    permalink: 'Permalink',
    meta: {
      title: 'Änderungsprotokoll',
      description: 'Alle neuesten Updates, Verbesserungen und Korrekturen.',
    },
  },
  inbox: {
    title: 'Posteingang',
    description:
      'Alles, was diese App Ihnen geschickt hat, ein Eintrag pro Benachrichtigung, egal auf welchem Weg.',
    rules: {
      live: 'Neue Einträge kommen live über einen Socket, ohne Neuladen.',
      read: 'Ein Eintrag gilt als gelesen, wenn Sie ihn hier öffnen oder seinen Link anklicken. Nur die E-Mail zu öffnen reicht nicht.',
      email:
        'Jeder Eintrag zeigt, was E-Mail und Push getan haben, damit klar ist, warum ein Kanal still blieb.',
    },
  },
  help: {
    title: 'Hilfe-Center',
    description:
      'Alles auf dieser Seite wurde in der Konsole geschrieben: eine Richtlinie, Docs, FAQs und Referenzen. Dort ändern, hier neu laden.',
    notConfigured: {
      title: 'Noch kein Inhalt',
      token:
        'Diese App hat kein Organisations-API-Token und kann daher keine Konsoleninhalte lesen. BUILDBASE_API_TOKEN setzen.',
      empty: 'Die Organisation hat noch keinen Demo-Inhalt. Anlegen mit:',
    },
    from: {
      richContent: 'Rich Content',
      docs: 'Docs',
      faqs: 'FAQ-Sammlung',
      testimonials: 'Referenzen',
    },
    docs: {
      title: 'Dokumentation',
      empty: 'Noch keine veröffentlichten Docs.',
    },
    faq: {
      title: 'Häufige Fragen',
    },
    testimonials: {
      title: 'Was Kunden sagen',
    },
  },
  waitlist: {
    title: 'Auf die Warteliste',
    description:
      'Das Beta-Formular der Plattform: Name und E-Mail hinterlassen, ein Admin schaltet Sie in der Konsole frei.',
    success:
      'Sie stehen auf der Liste. Ein Admin schaltet Sie aus der Konsole frei.',
    note: 'Formular und Texte kommen aus der Beta-Konfiguration der Organisation (Konsole → Users → Beta).',
  },
  account: {
    exports: {
      csv: 'CSV exportieren',
      locked: 'Exportieren',
      lockedHint:
        'Exporte sind Teil eines kostenpflichtigen Plans. Wähle einen Plan, um sie freizuschalten.',
    },
    creditPacks: {
      title: 'Credit-Pakete',
      description:
        'Lade jeden Plan auf. Credits bezahlen das Erstellen von Dokumenten und KI-Aktionen.',
      credits: '{count} Credits',
    },
    permissions: {
      title: 'Die Berechtigungen deiner Organisation',
      description:
        'In der BuildBase-Konsole definierte Schlüssel, pro Rolle vergeben, eigene Rollen eingeschlossen. Dokumente prüft sie auch auf dem Server.',
      empty:
        'Diese Organisation hat noch keine eigenen Berechtigungen definiert. Führe npm run seed:org aus oder lege Schlüssel in der Konsole unter Workspace settings → Permissions an.',
    },
    security: {
      title: 'Sicherheit',
      description:
        'Wo du überall angemeldet bist, welchen Geräten du vertraust und wie du das beendest.',
      sessions: {
        title: 'Sitzungen',
        description:
          'Jede Anmeldung ist eine Sitzung auf der Plattform. Meldest du eine ab, funktioniert sie sofort nirgends mehr.',
        signOut: 'Abmelden',
        empty: 'Keine weiteren Sitzungen.',
      },
      devices: {
        title: 'Geräte',
        description:
          'Browser und Rechner, von denen du dich angemeldet hast. Ein vertrautes Gerät überspringt zusätzliche Prüfungen.',
        signOut: 'Abmelden',
        empty: 'Noch keine Geräte.',
      },
      everywhere: {
        title: 'Überall abmelden',
        description:
          'Beendet jede deiner Sitzungen auf jedem Gerät, auch diese.',
        button: 'Überall abmelden',
        failed: 'Überall abmelden ist fehlgeschlagen. Versuche es erneut.',
        confirmTitle: 'Von allen Geräten abmelden?',
        confirmBody:
          'Jede Sitzung endet jetzt auf jedem Gerät, und du musst dich auch hier neu anmelden.',
        cancel: 'Abbrechen',
        working: 'Wird abgemeldet…',
      },
      passkeys: {
        title: 'Passkeys',
        description:
          'Melde dich per Fingerabdruck, Gesicht oder Geräte-PIN an. Passkeys werden auf der gehosteten Anmeldedomain registriert, daher öffnet sich dafür der SDK-Bildschirm.',
        button: 'Passkeys verwalten',
      },
      agents: {
        title: 'Verbundene Agenten',
        description:
          'KI-Agenten, denen du über MCP Zugriff gegeben hast. Prüfe und widerrufe sie in deinem Profil.',
        button: 'Profil öffnen',
      },
    },
    invitations: {
      title: 'Einladungen für dich',
      description:
        'Workspaces, die dich eingeladen haben. Nach dem Annehmen wechselst du in den Workspace.',
    },
    subscription: {
      cancel: 'Plan kündigen',
      canceling: 'Wird gekündigt…',
      resume: 'Plan behalten',
      resuming: 'Wird fortgesetzt…',
      endsOn: 'Endet am {date}',
      canceled: 'Der Plan endet zum Ende dieses Zeitraums.',
      resumed: 'Der Plan läuft weiter.',
      failed: 'Das hat nicht geklappt. Versuche es erneut.',
    },
    invoice: {
      details: 'Details',
      title: 'Rechnung {number}',
      loading: 'Rechnung wird geladen…',
      missing: 'Rechnung nicht gefunden.',
      status: 'Status',
      amountDue: 'Fälliger Betrag',
      amountPaid: 'Bezahlter Betrag',
      created: 'Ausgestellt',
      due: 'Fällig',
      note: 'Hinweis',
      open: 'Gehostete Rechnung öffnen',
      pdf: 'PDF herunterladen',
    },
    preferences: {
      title: 'Deine Benachrichtigungseinstellungen',
      description:
        'Wähle pro Ereignis, ob es dich per E-Mail oder Push erreicht. Was du nicht änderst, folgt der Workspace-Vorgabe.',
      loading: 'Deine Einstellungen werden geladen…',
      empty:
        'Dieser Workspace hat noch keine Benachrichtigungsereignisse. Sende unten eines, dann erscheint es hier.',
      failed: 'Deine Einstellungen konnten nicht gespeichert werden.',
      saved: 'Einstellung gespeichert.',
      required:
        'Dieses Ereignis ist in diesem Workspace verpflichtend und kann nicht abgeschaltet werden.',
      requiredBadge: 'Pflicht',
      email: 'E-Mail',
      push: 'Push',
      useDefault: 'Workspace-Vorgabe verwenden',
      refresh: 'Aktualisieren',
    },
    console: {
      title: 'Mit einer Vorlage starten',
      description:
        'Fertige Sets in der BuildBase-Konsole. Klone eines, und es landet ausgefüllt in deiner Organisation.',
      workflowTemplates: {
        title: 'Workflow-Vorlagen',
        description:
          'Zehn Workflows: Testphase endet, Zahlung fehlgeschlagen, Formular an Webhook, CRM-Sync und mehr.',
      },
      emailLibrary: {
        title: 'E-Mail-Vorlagenbibliothek',
        description: 'Über hundert E-Mail-Vorlagen, kostenlos in jedem Plan.',
      },
    },
  },
};

export default messages;
