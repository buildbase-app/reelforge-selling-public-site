// Not served: English only for now (src/i18n/config.ts). Starter demo copy;
// translate from en.ts before adding this locale back.
import type { DraftMessages } from '../types';

const messages: DraftMessages = {
  common: {
    nav: {
      home: 'Inicio',
      dashboard: 'Panel',
      team: 'Equipo',
      notifications: 'Notificaciones',
      settings: 'Configuración',
      menu: 'Menú',
      selectWorkspace: 'Seleccionar espacio de trabajo',
      profile: 'Perfil',
      security: 'Seguridad',
      manageWorkspace: 'Gestionar espacio de trabajo',
      generalSettings: 'Configuración general',
      userManagement: 'Gestión de usuarios',
      billingPayments: 'Facturación y pagos',
      invoices: 'Facturas',
      workspace: 'Espacio de trabajo',
      inbox: 'Bandeja',
      sections: {
        start: 'Inicio',
        product: 'Producto',
        billing: 'Facturación',
        platform: 'Plataforma',
      },
    },
    buttons: {
      signIn: 'Iniciar sesión',
      signOut: 'Cerrar sesión',
      submit: 'Enviar',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      loading: 'Cargando...',
    },
    auth: {
      signInPrompt: 'Por favor, inicia sesión para continuar',
      signOutConfirm: '¿Estás seguro de que quieres cerrar sesión?',
    },
    footer: {
      rights: 'Todos los derechos reservados',
      tagline:
        'Una app de demostración en vivo que muestra el BuildBase SDK en acción. Inicia sesión para explorar autenticación, workspaces, créditos, notificaciones push e i18n.',
      sections: {
        product: 'Producto',
        resources: 'Recursos',
        legal: 'Legal',
      },
      links: {
        pricing: 'Precios',
        dashboard: 'Panel',
        blog: 'Blog',
        changelog: 'Historial de cambios',
        privacy: 'Política de privacidad',
        terms: 'Términos de servicio',
      },
    },
    language: {
      select: 'Seleccionar idioma',
      current: 'Idioma actual',
    },
    accessibility: {
      skipToContent: 'Saltar al contenido',
    },
    theme: {
      toggle: 'Cambiar tema',
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
    },
    pages: {
      lastUpdated: 'Última actualización:',
    },
    redirecting: 'Redirigiendo...',
  },
  home: {
    title: 'BuildBase Demo',
    hero: {
      badge: 'Demo en vivo · 67 tareas',
      heading:
        'Cada capacidad de BuildBase, <highlight>una tarea a la vez</highlight>',
      description:
        'Una app real sobre el SDK de BuildBase, con un recorrido guiado: inicia sesión y prueba registro, espacios de trabajo, facturación, uso, créditos, notificaciones, agentes y webhooks, cada uno mostrando de dónde viene.',
      builtWith: 'Construido con',
    },
    stats: {
      languages: {
        label: 'Idiomas en esta demo',
        sublabel: 'cambia con el selector del encabezado',
      },
      tasks: {
        label: 'Tareas del recorrido',
        sublabel: 'cada una una capacidad que probar',
      },
      groups: {
        label: 'Grupos',
        sublabel: 'del inicio de sesión a los webhooks',
      },
      authCode: {
        label: 'Líneas de código de auth',
        sublabel: 'el SDK lo maneja todo',
      },
    },
    cta: {
      heading: '¿Listo para verlo todo en acción?',
      description:
        'Inicia sesión para abrir el panel completo — prueba cambiar espacios de trabajo, consumir créditos, enviar una notificación push y cambiar entre los 8 idiomas.',
    },
    meta: {
      title: 'Mi App',
      description: 'Mi aplicación Next.js con shadcn/ui y soporte de temas',
      tagline: 'Construye algo increíble',
    },
  },
  dashboard: {
    roles: {
      owner: 'Propietario',
      admin: 'Administrador',
      member: 'Miembro',
      editor: 'Editor',
      viewer: 'Lector',
    },
    title: 'Panel',
    welcome: '¡Bienvenido de nuevo, {name}!',
    trial: {
      endingSoon: 'Prueba por terminar',
      endingSoonMsg:
        'Tu prueba termina en {days} día{s}. Actualiza ahora para mantener el acceso.',
      upgrade: 'Actualizar',
      freeTrial: 'Estás en período de prueba',
      daysRemaining: '{days} días restantes',
      endsOn: 'Prueba termina el {date}',
      active: 'Prueba activa',
      viewPlans: 'Ver planes',
      trialBadge: 'Prueba',
    },
    noSubscription: {
      title: 'Sin suscripción activa',
      hint: 'Suscríbete para desbloquear funciones de pago',
      choosePlan: 'Elegir plan',
    },
    subscription: {
      statuses: {
        active: 'Activa',
        trialing: 'En prueba',
        canceled: 'Cancelada',
        past_due: 'Pago vencido',
        paused: 'En pausa',
        incomplete: 'Incompleta',
        unpaid: 'Sin pagar',
      },
      title: 'Suscripción',
      description: 'Tu plan actual',
      loading: 'Cargando...',
      status: 'Estado: {status}',
      activeSubscription: 'Suscripción activa',
      changePlan: 'Cambiar plan',
      noPlan: 'Sin plan activo',
      choosePlan: 'Elegir plan',
    },
    subscriptionGates: {
      whenSubscription: {
        title: 'Gate de suscripción',
        description: 'Solo visible con suscripción activa',
        fallback: 'Sin suscripción activa — actualiza para ver este contenido.',
        content: 'Tienes una suscripción activa — esta tarjeta es visible.',
      },
      whenSubscriptionToPlans: {
        title: 'Gate de plan',
        description: 'Solo visible con un plan específico',
        fallback: 'No estás en el plan Pro / Enterprise / Growth.',
        content:
          'Estás en Pro, Enterprise o Growth — contenido premium desbloqueado.',
      },
    },
    seatStatus: {
      title: 'Estado de asientos',
      description: 'Miembros vs límites del plan',
      members: 'Miembros',
      includedSeats: 'Asientos incluidos',
      maxUsers: 'Usuarios máx.',
      canInvite: 'Puede invitar',
      yes: 'Sí',
      no: 'No',
      limitReached:
        'Límite de asientos alcanzado — actualiza tu plan para invitar más miembros.',
    },
    quickActionButtons: {
      inviteTeam: 'Invitar equipo',
      manageSubscription: 'Gestionar suscripción',
      workspaceSettings: 'Configuración del espacio',
    },
    cards: {
      workspace: {
        title: 'Espacio de trabajo actual',
        empty: 'No hay espacio de trabajo seleccionado',
      },
      role: {
        title: 'Tu rol',
        empty: 'N/A',
      },
      email: {
        title: 'Correo electrónico',
      },
      status: {
        title: 'Estado',
        active: 'Activo',
        inactive: 'Inactivo',
      },
    },
    quickActions: {
      title: 'Acciones rápidas',
      createProject: 'Crear proyecto',
      viewReports: 'Ver informes',
      inviteTeam: 'Invitar miembro del equipo',
    },
    pages: {
      documents: {
        title: 'Documentos',
        description: 'Gestiona tus documentos',
        placeholder: 'El contenido de documentos va aquí.',
      },
      analytics: {
        title: 'Analíticas',
        description: 'Ver tus analíticas',
        placeholder: 'El contenido de analíticas va aquí.',
      },
      team: {
        title: 'Equipo',
        description: 'Gestiona tu equipo',
        placeholder: 'El contenido de gestión de equipo va aquí.',
      },
      settings: {
        title: 'Configuración',
        description: 'Gestiona tu configuración',
        placeholder: 'El contenido de configuración va aquí.',
      },
    },
  },
  team: {
    title: 'Equipo',
    description: 'Miembros del espacio de trabajo',
    inviteMember: 'Invitar miembro',
    seatLimitReached:
      'Límite de asientos alcanzado — actualiza tu plan para invitar más miembros.',
    cards: {
      members: 'Miembros',
      includedSeats: 'Asientos incluidos',
      maxUsers: 'Usuarios máx.',
      availableSeats: 'Asientos disponibles',
    },
    memberList: {
      title: 'Miembros',
      count: '{count} miembro(s) en este espacio de trabajo',
      empty: 'No se cargaron miembros. Asegúrate de estar autenticado.',
      roleFallback: 'miembro',
      changeRole: 'Cambiar rol',
    },
    invite: {
      title: 'Invitar por correo',
      description:
        'La dirección no necesita cuenta. Recibe un correo, sigue el enlace, se registra o inicia sesión y acepta.',
      noPermission: 'Tu rol no puede invitar miembros.',
      emailPlaceholder: 'nombre@empresa.com',
      role: 'Rol',
      send: 'Enviar invitación',
      sent: 'Invitación enviada a {email}',
      failed: 'Algo salió mal',
      resent: 'Invitación reenviada',
      revoked: 'Invitación revocada',
      seatNote:
        '{count} invitación(es) pendiente(s) ocupan un asiento hasta responderse.',
      pendingTitle: 'Pendientes',
      loading: 'Cargando…',
      none: 'Nada pendiente.',
      invitedBy: 'Invitado por {name}',
      pendingLabel: 'Pendiente',
      expires: 'caduca {date}',
      cooldown: 'Reenvío disponible en {seconds}s',
      resend: 'Reenviar',
      revoke: 'Revocar',
    },
    roleChanged: 'Rol cambiado a {role}',
    manage: {
      title: 'Gestionar miembros',
      description:
        'Abre el panel de configuración para gestionar roles e invitaciones',
      openSettings: 'Abrir configuración de miembros',
      permissions: 'Permisos',
    },
  },
  settings: {
    title: 'Configuración',
    description: 'Configuración del espacio de trabajo',
    card: {
      title: 'Configuración del espacio de trabajo',
      description:
        'Haz clic en cualquier sección para abrir el panel de configuración',
    },
    danger: {
      openButton: 'Abrir zona de peligro',
    },
    sections: {
      security: {
        label: 'Seguridad',
        description: 'Llaves de acceso y cómo inicias sesión',
      },
      devices: {
        label: 'Dispositivos',
        description: 'Navegadores y equipos con sesión iniciada',
      },
      'connected-agents': {
        label: 'Agentes conectados',
        description: 'Agentes de IA con acceso por MCP',
      },
      profile: {
        label: 'Perfil',
        description: 'Tu nombre, avatar y datos personales',
      },
      general: {
        label: 'General',
        description:
          'Nombre del espacio de trabajo, slug y configuración básica',
      },
      users: {
        label: 'Miembros e invitaciones',
        description:
          'Gestionar miembros del equipo, roles e invitaciones pendientes',
      },
      subscription: {
        label: 'Suscripción',
        description: 'Ver y cambiar tu plan actual',
      },
      usage: {
        label: 'Uso',
        description: 'Consumo de cuotas e historial de uso',
      },
      credits: {
        label: 'Créditos',
        description: 'Saldo de créditos y opciones de recarga',
      },
      features: {
        label: 'Indicadores de características',
        description:
          'Activar/desactivar características del espacio de trabajo',
      },
      notifications: {
        label: 'Notificaciones',
        description: 'Preferencias de notificaciones por correo y push',
      },
      permissions: {
        label: 'Permisos',
        description: 'Configuración de control de acceso basado en roles',
      },
      danger: {
        label: 'Zona de peligro',
        description: 'Eliminar espacio de trabajo o transferir propiedad',
      },
    },
  },
  invoices: {
    title: 'Facturas',
    description: 'Historial de facturación',
    refresh: 'Actualizar',
    billingPortal: 'Portal de facturación',
    billingPortalOpening: 'Abriendo…',
    error: 'Error al cargar facturas.',
    card: {
      title: 'Historial de facturas',
      found: '{count} factura(s) encontradas',
      empty:
        'Sin facturas aún. Las facturas aparecen aquí después de suscribirte a un plan de pago.',
    },
    table: {
      date: 'Fecha',
      amount: 'Monto',
      status: 'Estado',
      description: 'Descripción',
      links: 'Enlaces',
      view: 'Ver',
      pdf: 'PDF',
      loadMore: 'Cargar más',
    },
  },
  notifications: {
    title: 'Notificaciones',
    description: 'Envía una notificación desde esta app y mira dónde llega',
    pushCard: {
      title: 'Notificaciones push del navegador',
      description:
        'Habilitar notificaciones push del navegador para este dispositivo',
      subscribed: 'Suscrito',
      notSubscribed: 'No suscrito',
      subscribe: 'Suscribirse',
      unsubscribe: 'Cancelar suscripción',
    },
    sendCard: {
      title: 'Enviar notificación de prueba',
      description:
        'Completa los campos y envía una notificación. Las etiquetas {{name}}, {{workspaceName}}, {{url}} se resuelven automáticamente.',
    },
    fields: {
      eventSlug: 'Slug del evento',
      eventSlugHint:
        'El evento de demo es "{slug}", registrado en la consola con correo y push. Para solo push vale cualquier slug; el correo necesita un evento registrado.',
      title: 'Título',
      message: 'Mensaje',
      url: 'URL',
      target: 'Destinatario',
      channel: 'Canal',
    },
    placeholders: {
      eventSlug: 'ej. comment_added, deployment_success',
      title: 'Título de la notificación',
      message: 'Cuerpo push + mensaje email',
      url: 'Abre al hacer clic en push',
    },
    buttons: {
      meOnly: 'Solo yo',
      allMembers: 'Todos los miembros del espacio',
      both: 'Ambos',
      emailOnly: 'Solo email',
      pushOnly: 'Solo push',
      showAdvanced: 'Mostrar opciones avanzadas de push',
      hideAdvanced: 'Ocultar opciones avanzadas de push',
      send: 'Enviar notificación',
      sending: 'Enviando...',
      silent: 'Silencioso',
      requireInteraction: 'Requiere interacción',
      renotify: 'Renotificar',
      default: 'Por defecto',
    },
    advanced: {
      media: 'Medios',
      behavior: 'Comportamiento push',
      delivery: 'Entrega',
      actions: 'Botones de acción (máx. 2)',
      iconUrl: 'URL del icono',
      imageUrl: 'URL de la imagen',
      badgeUrl: 'URL del badge',
      tag: 'Etiqueta',
      tagHint:
        'Reemplaza la notificación con la misma etiqueta en lugar de apilar',
      behaviorHint:
        'Silencioso = sin sonido. Requiere interacción = permanece hasta que el usuario interactúa. Renotificar = sonido al reemplazar.',
      urgency: 'Urgencia',
      ttl: 'TTL (segundos)',
      schedule: 'Programar (ISO 8601)',
      action1: 'Acción 1',
      action2: 'Acción 2',
      actionTitlePlaceholder: 'Etiqueta del botón (ej. Responder)',
      actionKeyPlaceholder: 'Clave de acción (ej. reply)',
      iconUrlPlaceholder: 'Push icon (falls back to org icon)',
      imageUrlPlaceholder: 'Large image in push body',
      badgeUrlPlaceholder: 'Status bar icon (Android)',
      ttlPlaceholder: '86400 (24h default)',
    },
    context: {
      workspace: 'Espacio de trabajo:',
      user: 'Usuario:',
      none: 'Ninguno seleccionado',
    },
    resultCard: {
      title: 'Respuesta',
      description: 'Qué hizo la plataforma con el envío.',
      openInbox: 'Abrir bandeja',
    },
    toast: {
      workspaceRequired: 'Por favor selecciona un espacio de trabajo primero',
      sent: 'Notificación enviada a {count} usuario(s)',
      notSent: 'Notificación no enviada: {reason}',
      inboxHint: 'Mira la campana y tu bandeja.',
      pushEnabled: 'Notificaciones push habilitadas',
      pushDisabled: 'Notificaciones push deshabilitadas',
      pushFailed: 'Error al cambiar notificaciones push',
      networkError: 'Error de red — no se pudo conectar al servidor',
    },
  },
  profile: {
    agents: {
      title: 'Agentes conectados',
      description:
        'Clientes de IA que has autorizado a actuar como tú por MCP. Desconectar revoca su acceso.',
      guideTitle: 'Conectar un agente',
      guideDescription:
        'Esta app es un servidor MCP. Añádela a Claude, Cursor o ChatGPT e inicia sesión con tu cuenta de BuildBase; el agente leerá tus espacios de trabajo y los documentos de esta app con tus permisos.',
    },
    title: 'Perfil de usuario',
    description: 'Atributos de usuario e indicadores de características',
    identity: {
      title: 'Identidad',
      subtitle: 'Desde useSaaSAuth()',
      name: 'Nombre',
      email: 'Correo electrónico',
      role: 'Rol',
      id: 'ID',
    },
    workspaceFeatures: {
      title: 'Indicadores de características del espacio',
      enabled: 'Habilitado',
      disabled: 'Deshabilitado',
    },
    attributes: {
      title: 'Atributos del usuario',
      description: 'Pares clave-valor personalizados por usuario',
      empty: 'Sin atributos configurados aún.',
      setTitle: 'Establecer un atributo (demo)',
      keyPlaceholder: 'clave (ej. theme)',
      valuePlaceholder: 'valor',
      saving: 'Guardando…',
      save: 'Guardar',
      saved: '¡Guardado!',
      failed: 'Error al guardar.',
    },
    userFeatures: {
      title: 'Indicadores de características del usuario',
      description: 'Indicadores de características a nivel de usuario',
      empty: 'Sin indicadores configurados para este usuario.',
      loading: 'Cargando...',
      enabled: 'Habilitado',
      disabled: 'Deshabilitado',
    },
  },
  pricing: {
    title: 'Precios',
    subtitle: 'Elige el plan que se adapte a tus necesidades',
    meta: {
      title: 'Precios',
      description: 'Ver nuestros planes y precios',
    },
  },
  errors: {
    generic: {
      title: 'Algo salió mal',
      description:
        'Ocurrió un error inesperado. Por favor, inténtalo de nuevo o contacta con soporte si el problema persiste.',
      tryAgain: 'Intentar de nuevo',
      goHome: 'Ir al inicio',
    },
    notFound: {
      title: 'Página no encontrada',
      description:
        'Lo sentimos, no pudimos encontrar la página que buscas. Puede haber sido movida o eliminada.',
      goBack: 'Volver atrás',
    },
    blogNotFound: {
      title: 'Entrada no encontrada',
      description:
        'La entrada del blog que buscas no existe, puede haber sido eliminada o no está disponible en tu idioma.',
      browseAll: 'Ver todas las entradas',
    },
  },
  blog: {
    label: 'Blog',
    heading: 'Últimas entradas',
    description:
      'Actualizaciones, tutoriales y perspectivas de nuestro equipo.',
    noPosts: 'Aún no hay publicaciones. ¡Vuelve pronto!',
    noPostsTag: 'Aún no hay publicaciones con esta etiqueta.',
    noPostsCategory: 'Aún no hay publicaciones en esta categoría.',
    noPostsAuthor: 'Aún no hay publicaciones de este autor.',
    postsByAuthor: 'Publicaciones de {name}',
    postsTaggedCount:
      '{count, plural, one {# publicación etiquetada con "{tag}"} other {# publicaciones etiquetadas con "{tag}"}}',
    postsInCategoryCount:
      '{count, plural, one {# publicación en esta categoría} other {# publicaciones en esta categoría}}',
    readMore: 'Leer más',
    read: 'Leer',
    allPosts: '← Todas las publicaciones',
    previous: 'Anterior',
    next: 'Siguiente',
    pageOf: 'Página {page} de {total}',
    relatedPosts: 'Publicaciones relacionadas',
    share: 'Compartir',
    rssLabel: 'Feed RSS',
    shareAriaX: 'Compartir en X / Twitter',
    shareAriaLinkedin: 'Compartir en LinkedIn',
    shareAriaFacebook: 'Compartir en Facebook',
    shareAriaCopy: 'Copiar enlace',
    shareAriaCopied: '¡Enlace copiado!',
    search: {
      trigger: 'Buscar publicaciones...',
      placeholder: 'Buscar en el blog...',
      searching: 'Buscando...',
      noResults: 'Sin resultados para "{query}"',
      startTyping: 'Empieza a escribir para buscar...',
    },
    meta: {
      title: 'Blog',
      titlePage: 'Blog — Página {page}',
      description:
        'Últimas publicaciones, tutoriales y actualizaciones de nuestro equipo.',
      tagTitle: 'Publicaciones etiquetadas "{tag}"',
      tagDescription:
        'Todas las publicaciones del blog etiquetadas con "{tag}".',
      categoryTitle: '{category} — Blog',
      categoryDescription:
        'Publicaciones del blog en la categoría "{category}".',
    },
  },
  changelog: {
    label: 'Registro de cambios',
    heading: 'Novedades',
    description: 'Todas las últimas actualizaciones, mejoras y correcciones.',
    rssLabel: 'Feed RSS',
    permalink: 'Enlace permanente',
    meta: {
      title: 'Registro de cambios',
      description: 'Todas las últimas actualizaciones, mejoras y correcciones.',
    },
  },
  inbox: {
    title: 'Bandeja de entrada',
    description:
      'Todo lo que esta app te ha enviado, un elemento por notificación, se entregara como se entregara.',
    rules: {
      live: 'Los nuevos elementos llegan en vivo por socket; sin recargar.',
      read: 'Un elemento se marca como leído al abrirlo aquí o al pulsar su enlace. Abrir solo el correo no lo lee.',
      email:
        'Cada elemento muestra qué hicieron el correo y el push, para ver por qué un canal quedó en silencio.',
    },
  },
  help: {
    title: 'Centro de ayuda',
    description:
      'Todo en esta página se escribió en la consola: una política, docs, preguntas frecuentes y testimonios. Cámbialo allí, recarga aquí.',
    notConfigured: {
      title: 'Aún no hay contenido',
      token:
        'Esta app no tiene token de API de la organización, así que no puede leer contenido de la consola. Define BUILDBASE_API_TOKEN.',
      empty:
        'La organización aún no tiene el contenido de demo. Siémbralo con:',
    },
    from: {
      richContent: 'contenido enriquecido',
      docs: 'docs',
      faqs: 'colección de FAQ',
      testimonials: 'testimonios',
    },
    docs: {
      title: 'Documentación',
      empty: 'Aún no hay docs publicados.',
    },
    faq: {
      title: 'Preguntas frecuentes',
    },
    testimonials: {
      title: 'Lo que dicen los clientes',
    },
  },
  waitlist: {
    title: 'Únete a la lista de espera',
    description:
      'El formulario beta de la plataforma: deja tu nombre y correo, un administrador te aprueba en la consola.',
    success:
      'Estás en la lista. Un administrador te aprobará desde la consola.',
    note: 'El formulario y sus textos vienen de la configuración beta de la organización (consola → Users → Beta).',
  },
  account: {
    exports: {
      csv: 'Exportar CSV',
      locked: 'Exportar',
      lockedHint:
        'Las exportaciones forman parte de un plan de pago. Elige un plan para desbloquearlas.',
    },
    creditPacks: {
      title: 'Paquetes de créditos',
      description:
        'Recarga cualquier plan. Los créditos pagan la creación de documentos y las acciones de IA.',
      credits: '{count} créditos',
    },
    permissions: {
      title: 'Los permisos de tu organización',
      description:
        'Claves definidas en la consola de BuildBase y concedidas por rol, incluidos los roles personalizados. Documentos también las comprueba en el servidor.',
      empty:
        'Esta organización aún no ha definido sus propios permisos. Ejecuta npm run seed:org o añade claves en la consola, en Workspace settings → Permissions.',
    },
    security: {
      title: 'Seguridad',
      description:
        'Todos los lugares donde tienes la sesión iniciada, los dispositivos de confianza y las formas de cerrarlos.',
      sessions: {
        title: 'Sesiones',
        description:
          'Cada inicio de sesión es una sesión en la plataforma. Ciérrala y deja de funcionar en todas partes, al instante.',
        signOut: 'Cerrar sesión',
        empty: 'No hay otras sesiones.',
      },
      devices: {
        title: 'Dispositivos',
        description:
          'Navegadores y equipos desde los que has iniciado sesión. Un dispositivo de confianza omite comprobaciones adicionales.',
        signOut: 'Cerrar sesión',
        empty: 'Aún no hay dispositivos.',
      },
      everywhere: {
        title: 'Cerrar sesión en todas partes',
        description:
          'Termina todas tus sesiones en todos los dispositivos, incluida esta.',
        button: 'Cerrar sesión en todas partes',
        failed: 'No se pudo cerrar sesión en todas partes. Inténtalo de nuevo.',
        confirmTitle: '¿Cerrar sesión en todos los dispositivos?',
        confirmBody:
          'Todas las sesiones terminan ahora, en todos los dispositivos, y tendrás que volver a iniciar sesión aquí también.',
        cancel: 'Cancelar',
        working: 'Cerrando sesión…',
      },
      passkeys: {
        title: 'Llaves de acceso',
        description:
          'Inicia sesión con huella, rostro o PIN del dispositivo. Las llaves se registran en el dominio de inicio de sesión alojado, por eso se abre la pantalla del SDK.',
        button: 'Gestionar llaves de acceso',
      },
      agents: {
        title: 'Agentes conectados',
        description:
          'Agentes de IA a los que diste acceso por MCP. Revísalos y revócalos en tu perfil.',
        button: 'Abrir perfil',
      },
    },
    invitations: {
      title: 'Invitaciones pendientes',
      description:
        'Espacios de trabajo que te han invitado. Al aceptar, cambias a ese espacio.',
    },
    subscription: {
      cancel: 'Cancelar plan',
      canceling: 'Cancelando…',
      resume: 'Mantener plan',
      resuming: 'Reanudando…',
      endsOn: 'Termina el {date}',
      canceled: 'El plan termina al final de este periodo.',
      resumed: 'El plan continúa.',
      failed: 'No funcionó. Inténtalo de nuevo.',
    },
    invoice: {
      details: 'Detalles',
      title: 'Factura {number}',
      loading: 'Cargando la factura…',
      missing: 'Factura no encontrada.',
      status: 'Estado',
      amountDue: 'Importe pendiente',
      amountPaid: 'Importe pagado',
      created: 'Emitida',
      due: 'Vence',
      note: 'Nota',
      open: 'Abrir factura alojada',
      pdf: 'Descargar PDF',
    },
    preferences: {
      title: 'Tus preferencias de notificación',
      description:
        'Elige, por evento, si te llega por correo o push. Lo que no cambies sigue el valor del espacio de trabajo.',
      loading: 'Cargando tus preferencias…',
      empty:
        'Este espacio de trabajo aún no tiene eventos de notificación. Envía uno abajo y aparecerá aquí.',
      failed: 'No se pudieron guardar tus preferencias.',
      saved: 'Preferencia guardada.',
      required:
        'Este evento es obligatorio en este espacio de trabajo y no se puede desactivar.',
      requiredBadge: 'Obligatorio',
      email: 'Correo',
      push: 'Push',
      useDefault: 'Usar el valor del espacio de trabajo',
      refresh: 'Actualizar',
    },
    console: {
      title: 'Empieza con una plantilla',
      description:
        'Conjuntos listos en la consola de BuildBase. Clona uno y llega a tu organización ya rellenado.',
      workflowTemplates: {
        title: 'Plantillas de flujos',
        description:
          'Diez flujos: fin de prueba, pago fallido, formulario a webhook, sincronización con CRM y más.',
      },
      emailLibrary: {
        title: 'Biblioteca de plantillas de correo',
        description:
          'Más de cien plantillas de correo, gratis en todos los planes.',
      },
    },
  },
};

export default messages;
