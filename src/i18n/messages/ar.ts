// Not served: English only for now (src/i18n/config.ts). Starter demo copy;
// translate from en.ts before adding this locale back.
import type { DraftMessages } from '../types';

const messages: DraftMessages = {
  common: {
    nav: {
      home: 'الرئيسية',
      dashboard: 'لوحة التحكم',
      team: 'الفريق',
      notifications: 'الإشعارات',
      settings: 'الإعدادات',
      menu: 'القائمة',
      selectWorkspace: 'اختر مساحة العمل',
      profile: 'الملف الشخصي',
      security: 'الأمان',
      manageWorkspace: 'إدارة مساحة العمل',
      generalSettings: 'الإعدادات العامة',
      userManagement: 'إدارة المستخدمين',
      billingPayments: 'الفواتير والمدفوعات',
      invoices: 'الفواتير',
      workspace: 'مساحة العمل',
      inbox: 'البريد الوارد',
      sections: {
        start: 'البداية',
        product: 'المنتج',
        billing: 'الفوترة',
        platform: 'المنصة',
      },
    },
    buttons: {
      signIn: 'تسجيل الدخول',
      signOut: 'تسجيل الخروج',
      submit: 'إرسال',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      create: 'إنشاء',
      loading: 'جاري التحميل...',
    },
    auth: {
      signInPrompt: 'يرجى تسجيل الدخول للمتابعة',
      signOutConfirm: 'هل أنت متأكد من تسجيل الخروج؟',
    },
    footer: {
      rights: 'جميع الحقوق محفوظة',
      tagline:
        'تطبيق عرض مباشر يُظهر BuildBase SDK في العمل. سجّل الدخول لاستكشاف المصادقة ومساحات العمل والاعتمادات والإشعارات الفورية وi18n.',
      sections: {
        product: 'المنتج',
        resources: 'الموارد',
        legal: 'قانوني',
      },
      links: {
        pricing: 'الأسعار',
        dashboard: 'لوحة التحكم',
        blog: 'المدونة',
        changelog: 'سجل التغييرات',
        privacy: 'سياسة الخصوصية',
        terms: 'شروط الخدمة',
      },
    },
    language: {
      select: 'اختر اللغة',
      current: 'اللغة الحالية',
    },
    accessibility: {
      skipToContent: 'انتقل إلى المحتوى',
    },
    theme: {
      toggle: 'تبديل السمة',
      light: 'فاتح',
      dark: 'داكن',
      system: 'النظام',
    },
    pages: {
      lastUpdated: 'آخر تحديث:',
    },
    redirecting: 'جاري إعادة التوجيه...',
  },
  home: {
    title: 'BuildBase Demo',
    hero: {
      badge: 'عرض مباشر · 67 مهمة',
      heading: 'كل قدرة من BuildBase، <highlight>مهمة تلو الأخرى</highlight>',
      description:
        'تطبيق حقيقي مبني على BuildBase SDK مع جولة موجهة: سجّل الدخول وجرّب التسجيل ومساحات العمل والفوترة والاستخدام والرصيد والإشعارات والوكلاء والـ webhooks، وكل منها يبيّن مصدره.',
      signInToExplore: 'سجّل الدخول للاستكشاف',
      openDashboard: 'فتح لوحة التحكم',
      viewSource: 'عرض الكود المصدري',
      builtWith: 'مبني باستخدام',
    },
    stats: {
      languages: {
        label: 'اللغات في هذا العرض',
        sublabel: 'قم بالتبديل من خلال الزر في الرأس',
      },
      tasks: {
        label: 'مهام الجولة',
        sublabel: 'كل واحدة قدرة لتجربتها',
      },
      groups: {
        label: 'المجموعات',
        sublabel: 'من تسجيل الدخول إلى الـ webhooks',
      },
      authCode: {
        label: 'أسطر كود المصادقة',
        sublabel: 'SDK يتعامل مع كل شيء',
      },
    },
    cta: {
      heading: 'هل أنت مستعد لرؤية كل شيء يعمل؟',
      description:
        'سجّل الدخول لفتح لوحة التحكم الكاملة — جرّب تبديل مساحات العمل، واستهلاك الاعتمادات، وإرسال إشعار فوري، والتبديل بين جميع اللغات الـ8.',
      signIn: 'سجّل الدخول واستكشف',
      openDashboard: 'فتح لوحة التحكم',
      howBuilt: 'كيف تم بناؤه',
    },
    meta: {
      title: 'تطبيقي',
      description: 'تطبيق Next.js الخاص بي مع shadcn/ui ودعم السمات',
      tagline: 'ابنِ شيئًا مذهلاً',
    },
  },
  dashboard: {
    roles: {
      owner: 'المالك',
      admin: 'مسؤول',
      member: 'عضو',
      editor: 'محرّر',
      viewer: 'مشاهد',
    },
    title: 'لوحة التحكم',
    welcome: 'مرحباً بعودتك، {name}!',
    trial: {
      endingSoon: 'تنتهي الفترة التجريبية قريباً',
      endingSoonMsg:
        'تنتهي فترتك التجريبية خلال {days} يوم. قم بالترقية الآن للاحتفاظ بالوصول.',
      upgrade: 'ترقية',
      freeTrial: 'أنت على فترة تجريبية مجانية',
      daysRemaining: '{days} يوم متبقٍ',
      endsOn: 'تنتهي الفترة التجريبية في {date}',
      active: 'الفترة التجريبية نشطة',
      viewPlans: 'عرض الخطط',
      trialBadge: 'تجريبي',
    },
    noSubscription: {
      title: 'لا يوجد اشتراك نشط',
      hint: 'اشترك لفتح الميزات المدفوعة',
      choosePlan: 'اختر خطة',
    },
    subscription: {
      statuses: {
        active: 'نشط',
        trialing: 'فترة تجريبية',
        canceled: 'ملغى',
        past_due: 'متأخر السداد',
        paused: 'متوقف مؤقتًا',
        incomplete: 'غير مكتمل',
        unpaid: 'غير مدفوع',
      },
      title: 'الاشتراك',
      description: 'خطتك الحالية',
      loading: 'جاري التحميل...',
      status: 'الحالة: {status}',
      activeSubscription: 'اشتراك نشط',
      changePlan: 'تغيير الخطة',
      noPlan: 'لا توجد خطة نشطة',
      choosePlan: 'اختر خطة',
    },
    subscriptionGates: {
      whenSubscription: {
        title: 'بوابة الاشتراك',
        description: 'يظهر فقط عند وجود اشتراك نشط في مساحة العمل',
        fallback: 'لا يوجد اشتراك نشط — قم بالترقية لرؤية هذا المحتوى.',
        content: 'لديك اشتراك نشط — هذه البطاقة مرئية.',
      },
      whenSubscriptionToPlans: {
        title: 'بوابة الخطة',
        description: 'يظهر فقط عند الاشتراك في خطة محددة',
        fallback: 'لست في خطة Pro / Enterprise / Growth.',
        content:
          'أنت في خطة Pro أو Enterprise أو Growth — المحتوى المميز مفتوح.',
      },
    },
    seatStatus: {
      title: 'حالة المقاعد',
      description: 'عدد الأعضاء مقابل حدود الخطة',
      members: 'الأعضاء',
      includedSeats: 'المقاعد المشمولة',
      maxUsers: 'الحد الأقصى للمستخدمين',
      canInvite: 'يمكن الدعوة',
      yes: 'نعم',
      no: 'لا',
      limitReached:
        'تم الوصول لحد المقاعد — قم بترقية خطتك لدعوة المزيد من الأعضاء.',
    },
    quickActionButtons: {
      inviteTeam: 'دعوة الفريق',
      manageSubscription: 'إدارة الاشتراك',
      workspaceSettings: 'إعدادات مساحة العمل',
    },
    cards: {
      workspace: {
        title: 'مساحة العمل الحالية',
        empty: 'لم يتم تحديد مساحة عمل',
      },
      role: {
        title: 'دورك',
        empty: 'غير متوفر',
      },
      email: {
        title: 'البريد الإلكتروني',
      },
      status: {
        title: 'الحالة',
        active: 'نشط',
        inactive: 'غير نشط',
      },
    },
    quickActions: {
      title: 'إجراءات سريعة',
      createProject: 'إنشاء مشروع',
      viewReports: 'عرض التقارير',
      inviteTeam: 'دعوة عضو للفريق',
    },
    pages: {
      documents: {
        title: 'المستندات',
        description: 'إدارة مستنداتك',
        placeholder: 'محتوى المستندات سيظهر هنا.',
      },
      analytics: {
        title: 'التحليلات',
        description: 'عرض تحليلاتك',
        placeholder: 'محتوى التحليلات سيظهر هنا.',
      },
      team: {
        title: 'الفريق',
        description: 'إدارة فريقك',
        placeholder: 'محتوى إدارة الفريق سيظهر هنا.',
      },
      settings: {
        title: 'الإعدادات',
        description: 'إدارة إعداداتك',
        placeholder: 'محتوى الإعدادات سيظهر هنا.',
      },
    },
  },
  team: {
    title: 'الفريق',
    description: 'أعضاء مساحة العمل',
    inviteMember: 'دعوة عضو',
    seatLimitReached:
      'تم الوصول لحد المقاعد — قم بترقية خطتك لدعوة المزيد من الأعضاء.',
    cards: {
      members: 'الأعضاء',
      includedSeats: 'المقاعد المشمولة',
      maxUsers: 'الحد الأقصى للمستخدمين',
      availableSeats: 'المقاعد المتاحة',
    },
    memberList: {
      title: 'الأعضاء',
      count: '{count} عضو في هذه مساحة العمل',
      empty: 'لم يتم تحميل أعضاء. تأكد من تسجيل الدخول.',
      roleFallback: 'عضو',
      changeRole: 'تغيير الدور',
    },
    invite: {
      title: 'دعوة عبر البريد',
      description:
        'لا يحتاج العنوان إلى حساب. يصل بريد، يتبع الرابط، يسجّل أو يدخل، ثم يقبل.',
      noPermission: 'دورك لا يستطيع دعوة الأعضاء.',
      emailPlaceholder: 'name@company.com',
      role: 'الدور',
      send: 'إرسال الدعوة',
      sent: 'أُرسلت الدعوة إلى {email}',
      failed: 'حدث خطأ ما',
      resent: 'أُعيد إرسال الدعوة',
      revoked: 'أُلغيت الدعوة',
      seatNote: '{count} دعوة معلّقة تحجز مقعدًا حتى الرد عليها.',
      pendingTitle: 'معلّقة',
      loading: 'جارٍ التحميل…',
      none: 'لا شيء معلّق.',
      invitedBy: 'بدعوة من {name}',
      pendingLabel: 'معلّقة',
      expires: 'تنتهي في {date}',
      cooldown: 'يمكن إعادة الإرسال خلال {seconds} ث',
      resend: 'إعادة الإرسال',
      revoke: 'إلغاء',
    },
    roleChanged: 'تغيّر الدور إلى {role}',
    manage: {
      title: 'إدارة الأعضاء',
      description: 'افتح لوحة إعدادات مساحة العمل لإدارة الأدوار والدعوات',
      openSettings: 'فتح إعدادات الأعضاء',
      permissions: 'الأذونات',
    },
  },
  settings: {
    title: 'الإعدادات',
    description: 'إعدادات مساحة العمل',
    card: {
      title: 'إعدادات مساحة العمل',
      description: 'انقر على أي قسم لفتح لوحة إعدادات BuildBase',
    },
    danger: {
      openButton: 'فتح منطقة الخطر',
    },
    sections: {
      security: {
        label: 'الأمان',
        description: 'مفاتيح المرور وطريقة تسجيل الدخول',
      },
      devices: {
        label: 'الأجهزة',
        description: 'المتصفحات والأجهزة المسجّل دخولك عليها',
      },
      'connected-agents': {
        label: 'الوكلاء المتصلون',
        description: 'وكلاء الذكاء الاصطناعي الذين منحتهم وصولًا عبر MCP',
      },
      profile: {
        label: 'الملف الشخصي',
        description: 'اسمك وصورتك الرمزية وتفاصيلك الشخصية',
      },
      general: {
        label: 'عام',
        description: 'اسم مساحة العمل والـslug والإعدادات الأساسية',
      },
      users: {
        label: 'الأعضاء والدعوات',
        description: 'إدارة أعضاء الفريق والأدوار والدعوات المعلقة',
      },
      subscription: {
        label: 'الاشتراك',
        description: 'عرض وتغيير خطتك الحالية',
      },
      usage: {
        label: 'الاستخدام',
        description: 'استهلاك الحصص وسجل الاستخدام',
      },
      credits: {
        label: 'الاعتمادات',
        description: 'رصيد الاعتمادات وخيارات الإضافة',
      },
      features: {
        label: 'علامات الميزات',
        description: 'تبديلات الميزات على مستوى مساحة العمل',
      },
      notifications: {
        label: 'الإشعارات',
        description: 'تفضيلات إشعارات البريد الإلكتروني والدفع',
      },
      permissions: {
        label: 'الأذونات',
        description: 'إعدادات التحكم في الوصول القائم على الأدوار',
      },
      danger: {
        label: 'منطقة الخطر',
        description: 'حذف مساحة العمل أو نقل الملكية',
      },
    },
  },
  invoices: {
    title: 'الفواتير',
    description: 'سجل الفواتير',
    refresh: 'تحديث',
    billingPortal: 'بوابة الفوترة',
    billingPortalOpening: 'جاري الفتح…',
    error: 'فشل تحميل الفواتير.',
    card: {
      title: 'سجل الفواتير',
      found: 'تم العثور على {count} فاتورة',
      empty:
        'لا توجد فواتير بعد. ستظهر الفواتير هنا بعد الاشتراك في خطة مدفوعة.',
    },
    table: {
      date: 'التاريخ',
      amount: 'المبلغ',
      status: 'الحالة',
      description: 'الوصف',
      links: 'الروابط',
      view: 'عرض',
      pdf: 'PDF',
      loadMore: 'تحميل المزيد',
    },
  },
  notifications: {
    title: 'الإشعارات',
    description: 'أرسل إشعارًا من هذا التطبيق وشاهد أين يصل',
    pushCard: {
      title: 'إشعارات الدفع للمتصفح',
      description: 'تفعيل إشعارات الدفع للمتصفح لهذا الجهاز',
      subscribed: 'مشترك',
      notSubscribed: 'غير مشترك',
      subscribe: 'اشتراك',
      unsubscribe: 'إلغاء الاشتراك',
    },
    sendCard: {
      title: 'إرسال إشعار تجريبي',
      description:
        'أكمل الحقول أدناه وأرسل إشعاراً. يتم حل وسوم الدمج مثل {{name}} و{{workspaceName}} و{{url}} تلقائياً.',
    },
    fields: {
      eventSlug: 'معرّف الحدث',
      eventSlugHint:
        'حدث العرض هو "{slug}"، مسجّل في وحدة التحكم مع البريد والدفع. للدفع فقط يعمل أي معرّف؛ البريد يحتاج حدثًا مسجّلًا.',
      title: 'العنوان',
      message: 'الرسالة',
      url: 'الرابط',
      target: 'الهدف',
      channel: 'القناة',
    },
    placeholders: {
      eventSlug: 'مثال: comment_added, deployment_success',
      title: 'عنوان الإشعار (يرجع لاسم الحدث إن لم يُدخل)',
      message: 'نص الدفع + رسالة البريد الإلكتروني',
      url: 'يُفتح عند النقر على الإشعار',
    },
    buttons: {
      meOnly: 'أنا فقط',
      allMembers: 'جميع أعضاء مساحة العمل',
      both: 'كلاهما',
      emailOnly: 'البريد الإلكتروني فقط',
      pushOnly: 'الدفع فقط',
      showAdvanced: 'إظهار خيارات الدفع المتقدمة',
      hideAdvanced: 'إخفاء خيارات الدفع المتقدمة',
      send: 'إرسال الإشعار',
      sending: 'جاري الإرسال...',
      silent: 'صامت',
      requireInteraction: 'يتطلب تفاعلاً',
      renotify: 'إعادة الإشعار',
      default: 'افتراضي',
    },
    advanced: {
      media: 'الوسائط',
      behavior: 'سلوك الدفع',
      delivery: 'التسليم',
      actions: 'أزرار الإجراءات (بحد أقصى 2)',
      iconUrl: 'رابط الأيقونة',
      imageUrl: 'رابط الصورة',
      badgeUrl: 'رابط الشارة',
      tag: 'الوسم',
      tagHint: 'يستبدل الإشعار بنفس الوسم بدلاً من التراكم',
      behaviorHint:
        'صامت = بدون صوت/اهتزاز. يتطلب تفاعلاً = يبقى حتى تفاعل المستخدم. إعادة الإشعار = صوت مجدداً عند الاستبدال بالوسم.',
      urgency: 'الأولوية',
      ttl: 'TTL (ثوانٍ)',
      schedule: 'الجدولة (ISO 8601)',
      action1: 'الإجراء 1',
      action2: 'الإجراء 2',
      actionTitlePlaceholder: 'تسمية الزر (مثال: رد)',
      actionKeyPlaceholder: 'مفتاح الإجراء (مثال: reply)',
      iconUrlPlaceholder: 'أيقونة الدفع (يرجع لأيقونة المؤسسة)',
      imageUrlPlaceholder: 'صورة كبيرة في نص الدفع',
      badgeUrlPlaceholder: 'أيقونة شريط الحالة (Android)',
      ttlPlaceholder: '86400 (افتراضي 24 ساعة)',
    },
    context: {
      workspace: 'مساحة العمل:',
      user: 'المستخدم:',
      none: 'لم يتم الاختيار',
    },
    resultCard: {
      title: 'الاستجابة',
      description: 'ما فعلته المنصة بهذا الإرسال.',
      openInbox: 'فتح البريد الوارد',
    },
    toast: {
      workspaceRequired: 'يرجى اختيار مساحة عمل أولاً',
      sent: 'تم إرسال الإشعار لـ{count} مستخدم',
      notSent: 'لم يُرسل الإشعار: {reason}',
      inboxHint: 'تحقّق من الجرس وبريدك الوارد.',
      pushEnabled: 'تم تفعيل إشعارات الدفع',
      pushDisabled: 'تم تعطيل إشعارات الدفع',
      pushFailed: 'فشل تبديل إشعارات الدفع',
      networkError: 'خطأ في الشبكة — تعذّر الوصول للخادم',
    },
  },
  profile: {
    agents: {
      title: 'الوكلاء المتصلون',
      description:
        'عملاء الذكاء الاصطناعي الذين سمحت لهم بالتصرف باسمك عبر MCP. قطع الاتصال يلغي وصولهم.',
      guideTitle: 'ربط وكيل',
      guideDescription:
        'هذا التطبيق خادم MCP. أضفه إلى Claude أو Cursor أو ChatGPT وسجّل الدخول بحساب BuildBase؛ عندها يقرأ الوكيل مساحات عملك ومستندات هذا التطبيق بصلاحياتك.',
    },
    title: 'ملف المستخدم',
    description: 'سمات المستخدم وعلامات الميزات',
    identity: {
      title: 'الهوية',
      subtitle: 'من useSaaSAuth()',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      role: 'الدور',
      id: 'المعرّف',
    },
    workspaceFeatures: {
      title: 'علامات ميزات مساحة العمل',
      enabled: 'مفعّل',
      disabled: 'معطّل',
    },
    attributes: {
      title: 'سمات المستخدم',
      description: 'أزواج مفتاح-قيمة مخصصة مخزنة لكل مستخدم',
      empty: 'لم يتم تعيين أي سمات بعد.',
      setTitle: 'تعيين سمة (عرض مباشر)',
      keyPlaceholder: 'مفتاح (مثال: theme)',
      valuePlaceholder: 'قيمة',
      saving: 'جاري الحفظ…',
      save: 'حفظ',
      saved: 'تم الحفظ!',
      failed: 'فشل الحفظ.',
    },
    userFeatures: {
      title: 'علامات ميزات المستخدم',
      description: 'علامات الميزات على مستوى المستخدم',
      empty: 'لا توجد علامات ميزات مكوّنة لهذا المستخدم.',
      loading: 'جاري التحميل...',
      enabled: 'مفعّل',
      disabled: 'معطّل',
    },
  },
  pricing: {
    title: 'الأسعار',
    subtitle: 'اختر الخطة التي تناسب احتياجاتك',
    billing: 'الفوترة',
    monthly: 'شهري',
    quarterly: 'ربع سنوي',
    yearly: 'سنوي',
    perMonth: '/شهر',
    perQuarter: '/ربع',
    perYear: '/سنة',
    currency: 'العملة',
    quotas: 'الحصص',
    limits: 'الحدود',
    credits: 'اعتمادات AI',
    creditsPerPeriod: 'اعتمادات / دورة',
    features: 'الميزات',
    included: 'مشمول',
    perUnit: 'بعد ذلك',
    loading: 'جاري تحميل الخطط...',
    noPlans: 'لا توجد خطط متاحة',
    error: 'فشل تحميل الأسعار',
    meta: {
      title: 'الأسعار',
      description: 'عرض خططنا وأسعارنا',
    },
  },
  errors: {
    generic: {
      title: 'حدث خطأ ما',
      description:
        'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم إذا استمرت المشكلة.',
      tryAgain: 'حاول مرة أخرى',
      goHome: 'العودة للرئيسية',
    },
    notFound: {
      title: 'الصفحة غير موجودة',
      description:
        'عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها.',
      goBack: 'العودة',
    },
    blogNotFound: {
      title: 'المقالة غير موجودة',
      description:
        'المقالة التي تبحث عنها غير موجودة، ربما تم حذفها، أو غير متوفرة بلغتك.',
      browseAll: 'تصفح جميع المقالات',
    },
  },
  blog: {
    label: 'المدونة',
    heading: 'أحدث المقالات',
    description: 'تحديثات ودروس ورؤى من فريقنا.',
    noPosts: 'لا توجد مقالات بعد. تحقق مرة أخرى قريباً!',
    noPostsTag: 'لا توجد مقالات بهذا الوسم بعد.',
    noPostsCategory: 'لا توجد مقالات في هذه الفئة بعد.',
    noPostsAuthor: 'لا توجد مقالات لهذا المؤلف بعد.',
    postsByAuthor: 'مقالات {name}',
    postsTaggedCount: '{count} مقالة بوسم "{tag}"',
    postsInCategoryCount: '{count} مقالة في هذه الفئة',
    readMore: 'اقرأ المزيد',
    read: 'اقرأ',
    allPosts: '← جميع المقالات',
    previous: 'السابق',
    next: 'التالي',
    pageOf: 'صفحة {page} من {total}',
    relatedPosts: 'مقالات ذات صلة',
    share: 'مشاركة',
    rssLabel: 'خلاصة RSS',
    shareAriaX: 'مشاركة على X / تويتر',
    shareAriaLinkedin: 'مشاركة على LinkedIn',
    shareAriaFacebook: 'مشاركة على Facebook',
    shareAriaCopy: 'نسخ الرابط',
    shareAriaCopied: 'تم نسخ الرابط!',
    search: {
      trigger: 'البحث في المقالات...',
      placeholder: 'البحث في المدونة...',
      searching: 'جاري البحث...',
      noResults: 'لا نتائج لـ "{query}"',
      startTyping: 'ابدأ الكتابة للبحث...',
    },
    meta: {
      title: 'المدونة',
      titlePage: 'المدونة — الصفحة {page}',
      description: 'أحدث المقالات والدروس والتحديثات من فريقنا.',
      tagTitle: 'مقالات بوسم "{tag}"',
      tagDescription: 'جميع مقالات المدونة بوسم "{tag}".',
      categoryTitle: '{category} — المدونة',
      categoryDescription: 'مقالات المدونة في فئة "{category}".',
    },
  },
  changelog: {
    label: 'سجل التغييرات',
    heading: 'الجديد',
    description: 'جميع آخر التحديثات والتحسينات والإصلاحات.',
    rssLabel: 'خلاصة RSS',
    permalink: 'رابط دائم',
    meta: {
      title: 'سجل التغييرات',
      description: 'جميع آخر التحديثات والتحسينات والإصلاحات.',
    },
  },
  inbox: {
    title: 'البريد الوارد',
    description:
      'كل ما أرسله لك هذا التطبيق، عنصر واحد لكل إشعار، أيًا كانت طريقة التسليم.',
    rules: {
      live: 'تصل العناصر الجديدة مباشرة عبر مقبس؛ دون إعادة تحميل.',
      read: 'يُعدّ العنصر مقروءًا عند فتحه هنا أو النقر على رابطه. فتح البريد وحده لا يقرؤه.',
      email: 'يعرض كل عنصر ما فعله البريد والدفع، لتعرف لماذا صمت قناة ما.',
    },
  },
  help: {
    title: 'مركز المساعدة',
    description:
      'كل ما في هذه الصفحة كُتب في وحدة التحكم: سياسة، ومستندات، وأسئلة شائعة، وشهادات عملاء. غيّره هناك، وأعد التحميل هنا.',
    notConfigured: {
      title: 'لا محتوى بعد',
      token:
        'لا يملك هذا التطبيق رمز API للمؤسسة، لذا لا يستطيع قراءة محتوى وحدة التحكم. اضبط BUILDBASE_API_TOKEN.',
      empty: 'لا تملك المؤسسة محتوى العرض بعد. أنشئه بـ:',
    },
    from: {
      richContent: 'محتوى منسّق',
      docs: 'مستندات',
      faqs: 'مجموعة أسئلة شائعة',
      testimonials: 'شهادات',
    },
    docs: {
      title: 'التوثيق',
      empty: 'لا مستندات منشورة بعد.',
    },
    faq: {
      title: 'الأسئلة الشائعة',
    },
    testimonials: {
      title: 'ماذا يقول العملاء',
    },
  },
  waitlist: {
    title: 'انضم إلى قائمة الانتظار',
    description:
      'نموذج الإصدار التجريبي للمنصة: اترك اسمك وبريدك، ويوافق عليك المسؤول من وحدة التحكم.',
    success: 'أنت في القائمة. سيوافق عليك المسؤول من وحدة التحكم.',
    note: 'يأتي النموذج ونصوصه من إعداد الإصدار التجريبي للمؤسسة (وحدة التحكم → Users → Beta).',
  },
  account: {
    exports: {
      csv: 'تصدير CSV',
      locked: 'تصدير',
      lockedHint: 'التصدير جزء من خطة مدفوعة. اختر خطة لفتحه.',
    },
    creditPacks: {
      title: 'حزم الأرصدة',
      description:
        'اشحن أي خطة. تُستخدم الأرصدة لإنشاء المستندات وإجراءات الذكاء الاصطناعي.',
      credits: '{count} رصيد',
    },
    permissions: {
      title: 'أذونات مؤسستك',
      description:
        'مفاتيح معرّفة في لوحة تحكم BuildBase وممنوحة لكل دور، بما في ذلك الأدوار المخصصة. يتحقق قسم المستندات منها على الخادم أيضًا.',
      empty:
        'لم تعرّف هذه المؤسسة أذوناتها الخاصة بعد. شغّل npm run seed:org، أو أضف مفاتيح في لوحة التحكم ضمن Workspace settings → Permissions.',
    },
    security: {
      title: 'الأمان',
      description:
        'كل مكان سجّلت الدخول فيه، والأجهزة التي تثق بها، وطرق إنهائها.',
      sessions: {
        title: 'الجلسات',
        description:
          'كل تسجيل دخول هو جلسة على المنصة. سجّل الخروج من إحداها فتتوقف عن العمل في كل مكان فورًا.',
        signOut: 'تسجيل الخروج',
        empty: 'لا توجد جلسات أخرى.',
      },
      devices: {
        title: 'الأجهزة',
        description:
          'المتصفحات والأجهزة التي سجّلت الدخول منها. يتجاوز الجهاز الموثوق عمليات التحقق الإضافية.',
        signOut: 'تسجيل الخروج',
        empty: 'لا توجد أجهزة بعد.',
      },
      everywhere: {
        title: 'تسجيل الخروج من كل مكان',
        description: 'ينهي كل جلساتك على كل الأجهزة، بما فيها هذا الجهاز.',
        button: 'تسجيل الخروج من كل مكان',
        failed: 'تعذّر تسجيل الخروج من كل مكان. حاول مجددًا.',
        confirmTitle: 'تسجيل الخروج من كل الأجهزة؟',
        confirmBody:
          'تنتهي كل الجلسات الآن على كل الأجهزة، وستحتاج إلى تسجيل الدخول هنا أيضًا.',
        cancel: 'إلغاء',
        working: 'جارٍ تسجيل الخروج…',
      },
      passkeys: {
        title: 'مفاتيح المرور',
        description:
          'سجّل الدخول ببصمة الإصبع أو الوجه أو رمز PIN للجهاز. تُسجَّل مفاتيح المرور على نطاق تسجيل الدخول المستضاف، لذا تُفتح شاشة SDK لذلك.',
        button: 'إدارة مفاتيح المرور',
      },
      agents: {
        title: 'الوكلاء المتصلون',
        description:
          'وكلاء الذكاء الاصطناعي الذين منحتهم وصولًا عبر MCP. راجعهم وألغِ وصولهم من ملفك الشخصي.',
        button: 'فتح الملف الشخصي',
      },
    },
    invitations: {
      title: 'دعوات بانتظارك',
      description:
        'مساحات العمل التي دعتك. عند القبول تنتقل إلى مساحة العمل تلك.',
    },
    subscription: {
      cancel: 'إلغاء الخطة',
      canceling: 'جارٍ الإلغاء…',
      resume: 'الإبقاء على الخطة',
      resuming: 'جارٍ الاستئناف…',
      endsOn: 'تنتهي في {date}',
      canceled: 'تنتهي الخطة في نهاية هذه الفترة.',
      resumed: 'تستمر الخطة.',
      failed: 'لم ينجح ذلك. حاول مجددًا.',
    },
    invoice: {
      details: 'التفاصيل',
      title: 'الفاتورة {number}',
      loading: 'جارٍ تحميل الفاتورة…',
      missing: 'لم يتم العثور على الفاتورة.',
      status: 'الحالة',
      amountDue: 'المبلغ المستحق',
      amountPaid: 'المبلغ المدفوع',
      created: 'تاريخ الإصدار',
      due: 'تاريخ الاستحقاق',
      note: 'ملاحظة',
      open: 'فتح الفاتورة المستضافة',
      pdf: 'تنزيل PDF',
    },
    preferences: {
      title: 'تفضيلات الإشعارات الخاصة بك',
      description:
        'اختر لكل حدث ما إذا كان يصلك بالبريد الإلكتروني أو بالإشعار الفوري. ما لا تغيّره يتبع الإعداد الافتراضي لمساحة العمل.',
      loading: 'جارٍ تحميل تفضيلاتك…',
      empty:
        'لا توجد أحداث إشعارات في مساحة العمل هذه بعد. أرسل واحدًا من الأسفل وسيظهر هنا.',
      failed: 'تعذّر حفظ تفضيلاتك.',
      saved: 'تم حفظ التفضيل.',
      required: 'هذا الحدث إلزامي في مساحة العمل هذه ولا يمكن إيقافه.',
      requiredBadge: 'إلزامي',
      email: 'البريد الإلكتروني',
      push: 'إشعار فوري',
      useDefault: 'استخدام الإعداد الافتراضي لمساحة العمل',
      refresh: 'تحديث',
    },
    console: {
      title: 'ابدأ من قالب',
      description:
        'مجموعات جاهزة في لوحة تحكم BuildBase. انسخ واحدة فتصل إلى مؤسستك مملوءة.',
      workflowTemplates: {
        title: 'قوالب سير العمل',
        description:
          'عشرة مسارات عمل: انتهاء التجربة، فشل الدفع، النموذج إلى Webhook، مزامنة CRM والمزيد.',
      },
      emailLibrary: {
        title: 'مكتبة قوالب البريد الإلكتروني',
        description: 'أكثر من مئة قالب بريد إلكتروني، مجانًا في كل الخطط.',
      },
    },
  },
};

export default messages;
