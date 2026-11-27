// Not served: English only for now (src/i18n/config.ts). Starter demo copy;
// translate from en.ts before adding this locale back.
import type { DraftMessages } from '../types';

const messages: DraftMessages = {
  common: {
    nav: {
      home: 'Accueil',
      dashboard: 'Tableau de bord',
      team: 'Équipe',
      notifications: 'Notifications',
      settings: 'Paramètres',
      menu: 'Menu',
      selectWorkspace: "Sélectionner l'espace",
      profile: 'Profil',
      security: 'Sécurité',
      manageWorkspace: "Gérer l'espace",
      generalSettings: 'Paramètres généraux',
      userManagement: 'Gestion des utilisateurs',
      billingPayments: 'Facturation et paiements',
      invoices: 'Factures',
      workspace: 'Espace de travail',
      inbox: 'Boîte de réception',
      sections: {
        start: 'Démarrer',
        product: 'Produit',
        billing: 'Facturation',
        platform: 'Plateforme',
      },
    },
    buttons: {
      signIn: 'Se connecter',
      signOut: 'Se déconnecter',
      submit: 'Soumettre',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      loading: 'Chargement...',
    },
    auth: {
      signInPrompt: 'Veuillez vous connecter pour continuer',
      signOutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    },
    footer: {
      rights: 'Tous droits réservés',
      tagline:
        "Une application de démonstration en direct montrant le BuildBase SDK en action. Connectez-vous pour explorer l'authentification, les espaces de travail, les crédits, les notifications push et i18n.",
      sections: {
        product: 'Produit',
        resources: 'Ressources',
        legal: 'Légal',
      },
      links: {
        pricing: 'Tarifs',
        dashboard: 'Tableau de bord',
        blog: 'Blog',
        changelog: 'Journal des modifications',
        privacy: 'Politique de confidentialité',
        terms: "Conditions d'utilisation",
      },
    },
    language: {
      select: 'Choisir la langue',
      current: 'Langue actuelle',
    },
    accessibility: {
      skipToContent: 'Aller au contenu',
    },
    theme: {
      toggle: 'Changer le thème',
      light: 'Clair',
      dark: 'Sombre',
      system: 'Système',
    },
    pages: {
      lastUpdated: 'Dernière mise à jour :',
    },
    redirecting: 'Redirection...',
  },
  home: {
    title: 'BuildBase Demo',
    hero: {
      badge: 'Démo en direct · 67 tâches',
      heading:
        'Chaque capacité de BuildBase, <highlight>une tâche à la fois</highlight>',
      description:
        "Connectez-vous pour voir l'authentification, les espaces de travail multi-tenant, la facturation de crédits, les notifications push et l'i18n en 8 langues — propulsé par le BuildBase SDK.",
      builtWith: 'Construit avec',
    },
    stats: {
      languages: {
        label: 'Langues dans cette démo',
        sublabel: "changez avec le sélecteur dans l'en-tête",
      },
      tasks: {
        label: 'Tâches de la visite',
        sublabel: 'chacune une capacité à essayer',
      },
      groups: {
        label: 'Groupes',
        sublabel: 'de la connexion aux webhooks',
      },
      authCode: {
        label: "Lignes de code d'auth",
        sublabel: 'le SDK gère tout',
      },
    },
    cta: {
      heading: 'Prêt à voir tout fonctionner ?',
      description:
        "Connectez-vous pour ouvrir le tableau de bord complet — essayez de changer d'espace de travail, de consommer des crédits, d'envoyer une notification push et de basculer entre les 8 langues.",
    },
    meta: {
      title: 'Mon Application',
      description:
        'Une vraie app sur le SDK BuildBase, avec une visite guidée : connectez-vous et parcourez inscription, espaces de travail, facturation, usage, crédits, notifications, agents et webhooks, chacun montrant d’où il vient.',
      tagline: 'Construisez quelque chose de remarquable',
    },
  },
  dashboard: {
    roles: {
      owner: 'Propriétaire',
      admin: 'Administrateur',
      member: 'Membre',
      editor: 'Éditeur',
      viewer: 'Lecteur',
    },
    title: 'Tableau de bord',
    trial: {
      endingSoon: 'Essai bientôt terminé',
      endingSoonMsg:
        "Votre essai se termine dans {days} jour{s}. Passez à la version supérieure maintenant pour conserver l'accès.",
      upgrade: 'Mettre à niveau',
      freeTrial: "Vous êtes en période d'essai",
      daysRemaining: '{days} jours restants',
      endsOn: "L'essai se termine le {date}",
      active: 'Essai actif',
      viewPlans: 'Voir les plans',
      trialBadge: 'Essai',
    },
    noSubscription: {
      title: 'Aucun abonnement actif',
      hint: 'Abonnez-vous pour débloquer les fonctionnalités payantes',
      choosePlan: 'Choisir un plan',
    },
    subscription: {
      statuses: {
        active: 'Active',
        trialing: 'Essai en cours',
        canceled: 'Annulée',
        past_due: 'Paiement en retard',
        paused: 'En pause',
        incomplete: 'Incomplète',
        unpaid: 'Impayée',
      },
      title: 'Abonnement',
      description: 'Votre plan actuel',
      loading: 'Chargement...',
      status: 'Statut : {status}',
      activeSubscription: 'Abonnement actif',
      changePlan: 'Changer de plan',
      noPlan: 'Aucun plan actif',
      choosePlan: 'Choisir un plan',
    },
    subscriptionGates: {
      whenSubscription: {
        title: "Portail d'abonnement",
        description: 'Visible uniquement avec un abonnement actif',
        fallback:
          'Aucun abonnement actif — passez à la version supérieure pour voir ce contenu.',
        content: 'Vous avez un abonnement actif — cette carte est visible.',
      },
      whenSubscriptionToPlans: {
        title: 'Portail de plan',
        description: 'Visible uniquement avec un plan spécifique',
        fallback: "Vous n'êtes pas sur le plan Pro / Entreprise / Croissance.",
        content:
          'Vous êtes sur Pro, Entreprise ou Croissance — contenu premium débloqué.',
      },
    },
    seatStatus: {
      title: 'État des sièges',
      description: 'Membres vs limites du plan',
      members: 'Membres',
      includedSeats: 'Sièges inclus',
      maxUsers: 'Utilisateurs max.',
      canInvite: 'Peut inviter',
      yes: 'Oui',
      no: 'Non',
      limitReached:
        'Limite de sièges atteinte — mettez à niveau votre plan pour inviter plus de membres.',
    },
    quickActionButtons: {
      inviteTeam: "Inviter l'équipe",
      manageSubscription: "Gérer l'abonnement",
      workspaceSettings: "Paramètres de l'espace",
    },
    cards: {
      workspace: {
        title: 'Espace de travail actuel',
        empty: 'Aucun espace sélectionné',
      },
      role: {
        title: 'Votre rôle',
        empty: 'N/A',
      },
      email: {
        title: 'Adresse e-mail',
      },
      status: {
        title: 'Statut',
        active: 'Actif',
        inactive: 'Inactif',
      },
    },
    quickActions: {
      title: 'Actions rapides',
      createProject: 'Créer un projet',
      viewReports: 'Voir les rapports',
      inviteTeam: 'Inviter un membre',
    },
    pages: {
      documents: {
        title: 'Documents',
        description: 'Gérez vos documents',
        placeholder: 'Le contenu des documents va ici.',
      },
      analytics: {
        title: 'Analytiques',
        description: 'Voir vos analytiques',
        placeholder: 'Le contenu des analytiques va ici.',
      },
      team: {
        title: 'Équipe',
        description: 'Gérez votre équipe',
        placeholder: "Le contenu de gestion d'équipe va ici.",
      },
      settings: {
        title: 'Paramètres',
        description: 'Gérez vos paramètres',
        placeholder: 'Le contenu des paramètres va ici.',
      },
    },
  },
  team: {
    title: 'Équipe',
    description: "Membres de l'espace de travail",
    inviteMember: 'Inviter un membre',
    seatLimitReached:
      'Limite de sièges atteinte — mettez à niveau votre plan pour inviter plus de membres.',
    cards: {
      members: 'Membres',
      includedSeats: 'Sièges inclus',
      maxUsers: 'Utilisateurs max.',
      availableSeats: 'Sièges disponibles',
    },
    memberList: {
      title: 'Membres',
      count: '{count} membre(s) dans cet espace',
      empty: "Aucun membre chargé. Assurez-vous d'être authentifié.",
      roleFallback: 'membre',
      changeRole: 'Changer le rôle',
    },
    invite: {
      title: 'Inviter par e-mail',
      description:
        'L’adresse n’a pas besoin de compte. La personne reçoit un e-mail, suit le lien, s’inscrit ou se connecte, puis accepte.',
      noPermission: 'Votre rôle ne peut pas inviter de membres.',
      emailPlaceholder: 'nom@entreprise.com',
      role: 'Rôle',
      send: 'Envoyer l’invitation',
      sent: 'Invitation envoyée à {email}',
      failed: 'Une erreur est survenue',
      resent: 'Invitation renvoyée',
      revoked: 'Invitation révoquée',
      seatNote:
        '{count} invitation(s) en attente occupe(nt) un siège jusqu’à réponse.',
      pendingTitle: 'En attente',
      loading: 'Chargement…',
      none: 'Rien en attente.',
      invitedBy: 'Invité par {name}',
      pendingLabel: 'En attente',
      expires: 'expire le {date}',
      cooldown: 'Renvoi possible dans {seconds}s',
      resend: 'Renvoyer',
      revoke: 'Révoquer',
    },
    roleChanged: 'Rôle changé en {role}',
    manage: {
      title: 'Gérer les membres',
      description:
        'Ouvrez le panneau de paramètres pour gérer les rôles et les invitations',
      openSettings: 'Ouvrir les paramètres des membres',
      permissions: 'Permissions',
    },
  },
  settings: {
    title: 'Paramètres',
    description: "Configuration de l'espace de travail",
    card: {
      title: "Paramètres de l'espace de travail",
      description:
        'Cliquez sur une section pour ouvrir le panneau de paramètres',
    },
    danger: {
      openButton: 'Ouvrir la zone de danger',
    },
    sections: {
      security: {
        label: 'Sécurité',
        description: 'Clés d’accès et façon de vous connecter',
      },
      devices: {
        label: 'Appareils',
        description: 'Navigateurs et machines où vous êtes connecté',
      },
      'connected-agents': {
        label: 'Agents connectés',
        description: 'Agents IA auxquels vous avez donné accès via MCP',
      },
      profile: {
        label: 'Profil',
        description: 'Votre nom, avatar et données personnelles',
      },
      general: {
        label: 'Général',
        description: "Nom de l'espace, identifiant et configuration de base",
      },
      users: {
        label: 'Membres et invitations',
        description: 'Gérer les membres, rôles et invitations en attente',
      },
      subscription: {
        label: 'Abonnement',
        description: 'Voir et changer votre plan actuel',
      },
      usage: {
        label: 'Utilisation',
        description: "Consommation des quotas et historique d'utilisation",
      },
      credits: {
        label: 'Crédits',
        description: 'Solde de crédits et options de recharge',
      },
      features: {
        label: 'Indicateurs de fonctionnalités',
        description: "Activer/désactiver les fonctionnalités de l'espace",
      },
      notifications: {
        label: 'Notifications',
        description: 'Préférences de notifications par e-mail et push',
      },
      permissions: {
        label: 'Permissions',
        description: "Configuration du contrôle d'accès basé sur les rôles",
      },
      danger: {
        label: 'Zone de danger',
        description: "Supprimer l'espace ou transférer la propriété",
      },
    },
  },
  invoices: {
    title: 'Factures',
    description: 'Historique de facturation',
    refresh: 'Actualiser',
    billingPortal: 'Portail de facturation',
    billingPortalOpening: 'Ouverture…',
    error: 'Erreur lors du chargement des factures.',
    card: {
      title: 'Historique des factures',
      found: '{count} facture(s) trouvée(s)',
      empty:
        "Aucune facture pour l'instant. Les factures apparaissent ici après votre abonnement à un plan payant.",
    },
    table: {
      date: 'Date',
      amount: 'Montant',
      status: 'Statut',
      description: 'Description',
      links: 'Liens',
      view: 'Voir',
      pdf: 'PDF',
      loadMore: 'Charger plus',
    },
  },
  notifications: {
    title: 'Notifications',
    description:
      'Envoyez une notification depuis cette app et regardez où elle arrive',
    pushCard: {
      title: 'Notifications push du navigateur',
      description:
        'Activer les notifications push du navigateur pour cet appareil',
      subscribed: 'Abonné',
      notSubscribed: 'Non abonné',
      subscribe: "S'abonner",
      unsubscribe: 'Se désabonner',
    },
    sendCard: {
      title: 'Envoyer une notification de test',
      description:
        'Remplissez les champs et envoyez une notification. Les étiquettes {{name}}, {{workspaceName}}, {{url}} sont résolues automatiquement.',
    },
    fields: {
      eventSlug: "Identifiant de l'événement",
      eventSlugHint:
        'L’événement de démo est « {slug} », enregistré dans la console avec e-mail et push. N’importe quel slug marche pour le push seul ; l’e-mail exige un événement enregistré.',
      title: 'Titre',
      message: 'Message',
      url: 'URL',
      target: 'Destinataire',
      channel: 'Canal',
    },
    placeholders: {
      eventSlug: 'ex. comment_added, deployment_success',
      title: 'Titre de la notification',
      message: 'Corps push + message e-mail',
      url: 'Ouvre au clic sur push',
    },
    buttons: {
      meOnly: 'Moi seulement',
      allMembers: 'Tous les membres',
      both: 'Les deux',
      emailOnly: 'E-mail uniquement',
      pushOnly: 'Push uniquement',
      showAdvanced: 'Afficher les options avancées de push',
      hideAdvanced: 'Masquer les options avancées de push',
      send: 'Envoyer la notification',
      sending: 'Envoi...',
      silent: 'Silencieux',
      requireInteraction: 'Requiert une interaction',
      renotify: 'Renotifier',
      default: 'Par défaut',
    },
    advanced: {
      media: 'Médias',
      behavior: 'Comportement push',
      delivery: 'Livraison',
      actions: "Boutons d'action (max. 2)",
      iconUrl: "URL de l'icône",
      imageUrl: "URL de l'image",
      badgeUrl: 'URL du badge',
      tag: 'Étiquette',
      tagHint: "Remplace la notification avec le même tag plutôt que d'empiler",
      behaviorHint:
        "Silencieux = sans son. Requiert interaction = reste jusqu'à action utilisateur. Renotifier = son lors du remplacement.",
      urgency: 'Urgence',
      ttl: 'TTL (secondes)',
      schedule: 'Planifier (ISO 8601)',
      action1: 'Action 1',
      action2: 'Action 2',
      actionTitlePlaceholder: 'Étiquette du bouton (ex. Répondre)',
      actionKeyPlaceholder: "Clé d'action (ex. reply)",
      iconUrlPlaceholder: 'Push icon (falls back to org icon)',
      imageUrlPlaceholder: 'Large image in push body',
      badgeUrlPlaceholder: 'Status bar icon (Android)',
      ttlPlaceholder: '86400 (24h default)',
    },
    context: {
      workspace: 'Espace de travail :',
      user: 'Utilisateur :',
      none: 'Aucun sélectionné',
    },
    resultCard: {
      title: 'Réponse',
      description: 'Ce que la plateforme a fait de l’envoi.',
      openInbox: 'Ouvrir la boîte',
    },
    toast: {
      workspaceRequired: "Veuillez d'abord sélectionner un espace de travail",
      sent: 'Notification envoyée à {count} utilisateur(s)',
      notSent: 'Notification non envoyée : {reason}',
      inboxHint: 'Regardez la cloche et votre boîte de réception.',
      pushEnabled: 'Notifications push activées',
      pushDisabled: 'Notifications push désactivées',
      pushFailed: 'Erreur lors du changement des notifications push',
      networkError: 'Erreur réseau — impossible de se connecter au serveur',
    },
  },
  profile: {
    agents: {
      title: 'Agents connectés',
      description:
        'Clients IA que vous avez autorisés à agir en votre nom via MCP. Déconnecter révoque leur accès.',
      guideTitle: 'Connecter un agent',
      guideDescription:
        'Cette app est un serveur MCP. Ajoutez-la à Claude, Cursor ou ChatGPT et connectez-vous avec votre compte BuildBase ; l’agent lit alors vos espaces de travail et les documents de cette app avec vos permissions.',
    },
    title: 'Profil utilisateur',
    description: 'Attributs utilisateur et indicateurs de fonctionnalités',
    identity: {
      title: 'Identité',
      subtitle: 'Depuis useSaaSAuth()',
      name: 'Nom',
      email: 'Adresse e-mail',
      role: 'Rôle',
      id: 'ID',
    },
    workspaceFeatures: {
      title: "Indicateurs de fonctionnalités de l'espace",
      enabled: 'Activé',
      disabled: 'Désactivé',
    },
    attributes: {
      title: 'Attributs utilisateur',
      description: 'Paires clé-valeur personnalisées par utilisateur',
      empty: "Aucun attribut configuré pour l'instant.",
      setTitle: 'Définir un attribut (démo)',
      keyPlaceholder: 'clé (ex. theme)',
      valuePlaceholder: 'valeur',
      saving: 'Enregistrement…',
      save: 'Enregistrer',
      saved: 'Enregistré !',
      failed: "Échec de l'enregistrement.",
    },
    userFeatures: {
      title: 'Indicateurs de fonctionnalités utilisateur',
      description: 'Indicateurs de fonctionnalités au niveau utilisateur',
      empty: 'Aucun indicateur configuré pour cet utilisateur.',
      loading: 'Chargement...',
      enabled: 'Activé',
      disabled: 'Désactivé',
    },
  },
  pricing: {
    title: 'Tarifs',
    subtitle: 'Choisissez le plan adapté à vos besoins',
    meta: {
      title: 'Tarifs',
      description: 'Voir nos plans et tarifs',
    },
  },
  errors: {
    generic: {
      title: "Une erreur s'est produite",
      description:
        "Une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support si le problème persiste.",
      tryAgain: 'Réessayer',
      goHome: "Aller à l'accueil",
    },
    notFound: {
      title: 'Page introuvable',
      description:
        "Désolé, nous n'avons pas pu trouver la page que vous recherchez. Elle a peut-être été déplacée ou supprimée.",
      goBack: 'Retour',
    },
    blogNotFound: {
      title: 'Article introuvable',
      description:
        "L'article de blog que vous recherchez n'existe pas, a peut-être été supprimé ou n'est pas disponible dans votre langue.",
      browseAll: 'Parcourir tous les articles',
    },
  },
  blog: {
    label: 'Blog',
    heading: 'Derniers articles',
    description: 'Mises à jour, tutoriels et perspectives de notre équipe.',
    noPosts: 'Aucun article pour le moment. Revenez bientôt !',
    noPostsTag: 'Aucun article avec ce tag pour le moment.',
    noPostsCategory: 'Aucun article dans cette catégorie pour le moment.',
    noPostsAuthor: 'Aucun article de cet auteur pour le moment.',
    postsByAuthor: 'Articles de {name}',
    postsTaggedCount:
      '{count, plural, one {# article tagué "{tag}"} other {# articles tagués "{tag}"}}',
    postsInCategoryCount:
      '{count, plural, one {# article dans cette catégorie} other {# articles dans cette catégorie}}',
    readMore: 'Lire plus',
    read: 'Lire',
    allPosts: '← Tous les articles',
    previous: 'Précédent',
    next: 'Suivant',
    pageOf: 'Page {page} sur {total}',
    relatedPosts: 'Articles connexes',
    share: 'Partager',
    rssLabel: 'Flux RSS',
    shareAriaX: 'Partager sur X / Twitter',
    shareAriaLinkedin: 'Partager sur LinkedIn',
    shareAriaFacebook: 'Partager sur Facebook',
    shareAriaCopy: 'Copier le lien',
    shareAriaCopied: 'Lien copié !',
    search: {
      trigger: 'Rechercher des articles...',
      placeholder: 'Rechercher dans le blog...',
      searching: 'Recherche en cours...',
      noResults: 'Aucun résultat pour « {query} »',
      startTyping: 'Commencez à taper pour rechercher...',
    },
    meta: {
      title: 'Blog',
      titlePage: 'Blog — Page {page}',
      description:
        'Derniers articles, tutoriels et mises à jour de notre équipe.',
      tagTitle: 'Articles tagués « {tag} »',
      tagDescription: 'Tous les articles du blog tagués avec « {tag} ».',
      categoryTitle: '{category} — Blog',
      categoryDescription: 'Articles du blog dans la catégorie « {category} ».',
    },
  },
  changelog: {
    label: 'Journal des modifications',
    heading: 'Quoi de neuf',
    description:
      'Toutes les dernières mises à jour, améliorations et corrections.',
    rssLabel: 'Flux RSS',
    permalink: 'Lien permanent',
    meta: {
      title: 'Journal des modifications',
      description:
        'Toutes les dernières mises à jour, améliorations et corrections.',
    },
  },
  inbox: {
    title: 'Boîte de réception',
    description:
      'Tout ce que cette app vous a envoyé, un élément par notification, quel que soit le canal.',
    rules: {
      live: 'Les nouveaux éléments arrivent en direct par socket, sans recharger.',
      read: 'Un élément est lu quand vous l’ouvrez ici ou cliquez son lien. Ouvrir l’e-mail seul ne le lit pas.',
      email:
        'Chaque élément montre ce qu’ont fait l’e-mail et le push, pour voir pourquoi un canal est resté muet.',
    },
  },
  help: {
    title: "Centre d'aide",
    description:
      'Tout sur cette page a été écrit dans la console : une politique, des docs, une FAQ et des témoignages. Modifiez-le là-bas, rechargez ici.',
    notConfigured: {
      title: 'Pas encore de contenu',
      token:
        "Cette app n'a pas de jeton d'API d'organisation, elle ne peut donc pas lire le contenu de la console. Définissez BUILDBASE_API_TOKEN.",
      empty:
        "L'organisation n'a pas encore le contenu de démo. Initialisez-le avec :",
    },
    from: {
      richContent: 'contenu riche',
      docs: 'docs',
      faqs: 'collection FAQ',
      testimonials: 'témoignages',
    },
    docs: {
      title: 'Documentation',
      empty: "Aucun doc publié pour l'instant.",
    },
    faq: {
      title: 'Questions fréquentes',
    },
    testimonials: {
      title: 'Ce que disent les clients',
    },
  },
  waitlist: {
    title: 'Rejoindre la liste d’attente',
    description:
      'Le formulaire bêta de la plateforme : laissez votre nom et votre e-mail, un administrateur vous approuve dans la console.',
    success:
      'Vous êtes sur la liste. Un administrateur vous approuvera depuis la console.',
    note: 'Le formulaire et ses textes viennent de la configuration bêta de l’organisation (console → Users → Beta).',
  },
  account: {
    exports: {
      csv: 'Exporter en CSV',
      locked: 'Exporter',
      lockedHint:
        'Les exports font partie d’une offre payante. Choisissez une offre pour les débloquer.',
    },
    creditPacks: {
      title: 'Packs de crédits',
      description:
        'Rechargez n’importe quelle offre. Les crédits paient la création de documents et les actions IA.',
      credits: '{count} crédits',
    },
    permissions: {
      title: 'Les permissions de votre organisation',
      description:
        'Clés définies dans la console BuildBase et accordées par rôle, rôles personnalisés compris. Documents les vérifie aussi côté serveur.',
      empty:
        'Cette organisation n’a pas encore défini ses propres permissions. Lancez npm run seed:org, ou ajoutez des clés dans la console, sous Workspace settings → Permissions.',
    },
    security: {
      title: 'Sécurité',
      description:
        'Tous les endroits où vous êtes connecté, les appareils de confiance, et les moyens d’y mettre fin.',
      sessions: {
        title: 'Sessions',
        description:
          'Chaque connexion est une session sur la plateforme. Déconnectez-en une et elle cesse de fonctionner partout, immédiatement.',
        signOut: 'Déconnecter',
        empty: 'Aucune autre session.',
      },
      devices: {
        title: 'Appareils',
        description:
          'Navigateurs et machines depuis lesquels vous vous êtes connecté. Un appareil de confiance évite les vérifications supplémentaires.',
        signOut: 'Déconnecter',
        empty: 'Aucun appareil pour l’instant.',
      },
      everywhere: {
        title: 'Se déconnecter partout',
        description:
          'Met fin à toutes vos sessions, sur tous les appareils, y compris celui-ci.',
        button: 'Se déconnecter partout',
        failed: 'Impossible de se déconnecter partout. Réessayez.',
        confirmTitle: 'Se déconnecter de tous les appareils ?',
        confirmBody:
          'Toutes les sessions se terminent maintenant, sur tous les appareils, et vous devrez aussi vous reconnecter ici.',
        cancel: 'Annuler',
        working: 'Déconnexion…',
      },
      passkeys: {
        title: 'Clés d’accès',
        description:
          'Connectez-vous par empreinte, visage ou code de l’appareil. Les clés s’enregistrent sur le domaine de connexion hébergé, d’où l’ouverture de l’écran du SDK.',
        button: 'Gérer les clés d’accès',
      },
      agents: {
        title: 'Agents connectés',
        description:
          'Les agents IA auxquels vous avez donné accès via MCP. Consultez-les et révoquez-les depuis votre profil.',
        button: 'Ouvrir le profil',
      },
    },
    invitations: {
      title: 'Invitations en attente',
      description:
        'Les espaces de travail qui vous ont invité. Accepter vous fait passer dans cet espace.',
    },
    subscription: {
      cancel: 'Annuler l’offre',
      canceling: 'Annulation…',
      resume: 'Conserver l’offre',
      resuming: 'Reprise…',
      endsOn: 'Se termine le {date}',
      canceled: 'L’offre se termine à la fin de cette période.',
      resumed: 'L’offre continue.',
      failed: 'Cela n’a pas fonctionné. Réessayez.',
    },
    invoice: {
      details: 'Détails',
      title: 'Facture {number}',
      loading: 'Chargement de la facture…',
      missing: 'Facture introuvable.',
      status: 'Statut',
      amountDue: 'Montant dû',
      amountPaid: 'Montant payé',
      created: 'Émise',
      due: 'Échéance',
      note: 'Note',
      open: 'Ouvrir la facture hébergée',
      pdf: 'Télécharger le PDF',
    },
    preferences: {
      title: 'Vos préférences de notification',
      description:
        'Choisissez, par événement, s’il vous parvient par e-mail ou push. Ce que vous ne touchez pas suit la valeur de l’espace de travail.',
      loading: 'Chargement de vos préférences…',
      empty:
        'Cet espace de travail n’a encore aucun événement de notification. Envoyez-en un ci-dessous et il apparaîtra ici.',
      failed: 'Vos préférences n’ont pas pu être enregistrées.',
      saved: 'Préférence enregistrée.',
      required:
        'Cet événement est obligatoire dans cet espace de travail et ne peut pas être désactivé.',
      requiredBadge: 'Obligatoire',
      email: 'E-mail',
      push: 'Push',
      useDefault: 'Utiliser la valeur de l’espace de travail',
      refresh: 'Actualiser',
    },
    console: {
      title: 'Partir d’un modèle',
      description:
        'Des ensembles prêts à l’emploi dans la console BuildBase. Clonez-en un et il arrive dans votre organisation, déjà rempli.',
      workflowTemplates: {
        title: 'Modèles de workflows',
        description:
          'Dix workflows : fin d’essai, paiement échoué, formulaire vers webhook, synchronisation CRM et plus.',
      },
      emailLibrary: {
        title: 'Bibliothèque de modèles d’e-mails',
        description:
          'Plus de cent modèles d’e-mails, gratuits sur toutes les offres.',
      },
    },
  },
};

export default messages;
