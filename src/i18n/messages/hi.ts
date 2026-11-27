// Not served: English only for now (src/i18n/config.ts). Starter demo copy;
// translate from en.ts before adding this locale back.
import type { DraftMessages } from '../types';

const messages: DraftMessages = {
  common: {
    nav: {
      home: 'होम',
      dashboard: 'डैशबोर्ड',
      team: 'टीम',
      notifications: 'सूचनाएं',
      settings: 'सेटिंग्स',
      menu: 'मेनू',
      selectWorkspace: 'वर्कस्पेस चुनें',
      profile: 'प्रोफ़ाइल',
      security: 'सुरक्षा',
      manageWorkspace: 'वर्कस्पेस प्रबंधित करें',
      generalSettings: 'सामान्य सेटिंग्स',
      userManagement: 'उपयोगकर्ता प्रबंधन',
      billingPayments: 'बिलिंग और भुगतान',
      invoices: 'चालान',
      workspace: 'वर्कस्पेस',
      inbox: 'इनबॉक्स',
      sections: {
        start: 'शुरुआत',
        product: 'प्रोडक्ट',
        billing: 'बिलिंग',
        platform: 'प्लेटफ़ॉर्म',
      },
    },
    buttons: {
      signIn: 'साइन इन करें',
      signOut: 'साइन आउट करें',
      submit: 'सबमिट करें',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      create: 'बनाएं',
      loading: 'लोड हो रहा है...',
    },
    auth: {
      signInPrompt: 'जारी रखने के लिए कृपया साइन इन करें',
      signOutConfirm: 'क्या आप वाकई साइन आउट करना चाहते हैं?',
    },
    footer: {
      rights: 'सर्वाधिकार सुरक्षित',
      tagline:
        'एक लाइव डेमो ऐप जो BuildBase SDK को काम करते हुए दिखाता है। साइन इन करें और प्रमाणीकरण, वर्कस्पेस, क्रेडिट, पुश नोटिफिकेशन और i18n को एक्सप्लोर करें।',
      sections: {
        product: 'उत्पाद',
        resources: 'संसाधन',
        legal: 'कानूनी',
      },
      links: {
        pricing: 'मूल्य निर्धारण',
        dashboard: 'डैशबोर्ड',
        blog: 'ब्लॉग',
        changelog: 'परिवर्तन लॉग',
        privacy: 'गोपनीयता नीति',
        terms: 'सेवा की शर्तें',
      },
    },
    language: {
      select: 'भाषा चुनें',
      current: 'वर्तमान भाषा',
    },
    accessibility: {
      skipToContent: 'सामग्री पर जाएं',
    },
    theme: {
      toggle: 'थीम बदलें',
      light: 'हल्का',
      dark: 'गहरा',
      system: 'सिस्टम',
    },
    pages: {
      lastUpdated: 'अंतिम अपडेट:',
    },
    redirecting: 'रीडायरेक्ट हो रहा है...',
  },
  home: {
    title: 'BuildBase Demo',
    hero: {
      badge: 'लाइव डेमो · 67 कार्य',
      heading:
        'BuildBase की हर क्षमता, <highlight>एक बार में एक कार्य</highlight>',
      description:
        'BuildBase SDK पर बना असली ऐप, गाइडेड टूर के साथ: साइन इन करें और साइन-अप, वर्कस्पेस, बिलिंग, उपयोग, क्रेडिट, सूचनाएँ, एजेंट और वेबहुक आज़माएँ, हर एक बताता है कि वह कहाँ से आता है।',
      builtWith: 'इनके साथ बनाया',
    },
    stats: {
      languages: {
        label: 'इस डेमो में भाषाएं',
        sublabel: 'हेडर टॉगल से बदलें',
      },
      tasks: {
        label: 'टूर के कार्य',
        sublabel: 'हर एक आज़माने योग्य क्षमता',
      },
      groups: {
        label: 'समूह',
        sublabel: 'साइन-इन से वेबहुक तक',
      },
      authCode: {
        label: 'प्रमाणीकरण कोड की लाइनें',
        sublabel: 'SDK सब संभालता है',
      },
    },
    cta: {
      heading: 'सब कुछ काम करता देखना चाहते हैं?',
      description:
        'साइन इन करें और पूरा डैशबोर्ड खोलें — वर्कस्पेस बदलें, क्रेडिट उपयोग करें, पुश नोटिफिकेशन भेजें और सभी 8 भाषाओं में स्विच करें।',
    },
    meta: {
      title: 'मेरा ऐप',
      description: 'shadcn/ui और थीम सपोर्ट के साथ मेरा Next.js ऐप',
      tagline: 'कुछ शानदार बनाएं',
    },
  },
  dashboard: {
    roles: {
      owner: 'स्वामी',
      admin: 'प्रशासक',
      member: 'सदस्य',
      editor: 'संपादक',
      viewer: 'दर्शक',
    },
    title: 'डैशबोर्ड',
    trial: {
      endingSoon: 'ट्रायल जल्द समाप्त होगा',
      endingSoonMsg:
        'आपका ट्रायल {days} दिन में समाप्त होता है। एक्सेस बनाए रखने के लिए अभी अपग्रेड करें।',
      upgrade: 'अपग्रेड करें',
      freeTrial: 'आप ट्रायल अवधि में हैं',
      daysRemaining: '{days} दिन शेष',
      endsOn: 'ट्रायल {date} को समाप्त होता है',
      active: 'ट्रायल सक्रिय',
      viewPlans: 'प्लान देखें',
      trialBadge: 'ट्रायल',
    },
    noSubscription: {
      title: 'कोई सक्रिय सदस्यता नहीं',
      hint: 'भुगतान सुविधाओं को अनलॉक करने के लिए सदस्यता लें',
      choosePlan: 'प्लान चुनें',
    },
    subscription: {
      statuses: {
        active: 'सक्रिय',
        trialing: 'परीक्षण में',
        canceled: 'रद्द',
        past_due: 'भुगतान बकाया',
        paused: 'रोका गया',
        incomplete: 'अधूरा',
        unpaid: 'अदत्त',
      },
      title: 'सदस्यता',
      description: 'आपका वर्तमान प्लान',
      loading: 'लोड हो रहा है...',
      status: 'स्थिति: {status}',
      activeSubscription: 'सक्रिय सदस्यता',
      changePlan: 'प्लान बदलें',
      noPlan: 'कोई सक्रिय प्लान नहीं',
      choosePlan: 'प्लान चुनें',
    },
    subscriptionGates: {
      whenSubscription: {
        title: 'सदस्यता गेट',
        description: 'केवल सक्रिय सदस्यता के साथ दृश्यमान',
        fallback:
          'कोई सक्रिय सदस्यता नहीं — यह सामग्री देखने के लिए अपग्रेड करें।',
        content: 'आपकी सक्रिय सदस्यता है — यह कार्ड दृश्यमान है।',
      },
      whenSubscriptionToPlans: {
        title: 'प्लान गेट',
        description: 'केवल विशिष्ट प्लान के साथ दृश्यमान',
        fallback: 'आप Pro / Enterprise / Growth प्लान पर नहीं हैं।',
        content:
          'आप Pro, Enterprise या Growth पर हैं — प्रीमियम सामग्री अनलॉक।',
      },
    },
    seatStatus: {
      title: 'सीट स्थिति',
      description: 'सदस्य बनाम प्लान सीमाएं',
      members: 'सदस्य',
      includedSeats: 'शामिल सीटें',
      maxUsers: 'अधिकतम उपयोगकर्ता',
      canInvite: 'आमंत्रित कर सकते हैं',
      yes: 'हां',
      no: 'नहीं',
      limitReached:
        'सीट सीमा पहुंच गई — अधिक सदस्यों को आमंत्रित करने के लिए अपने प्लान को अपग्रेड करें।',
    },
    quickActionButtons: {
      inviteTeam: 'टीम आमंत्रित करें',
      manageSubscription: 'सदस्यता प्रबंधित करें',
      workspaceSettings: 'वर्कस्पेस सेटिंग्स',
    },
    cards: {
      workspace: {
        title: 'वर्तमान वर्कस्पेस',
        empty: 'कोई वर्कस्पेस नहीं चुना',
      },
      role: {
        title: 'आपकी भूमिका',
        empty: 'N/A',
      },
      email: {
        title: 'ईमेल पता',
      },
      status: {
        title: 'स्थिति',
        active: 'सक्रिय',
        inactive: 'निष्क्रिय',
      },
    },
    quickActions: {
      title: 'त्वरित कार्रवाई',
      createProject: 'प्रोजेक्ट बनाएं',
      viewReports: 'रिपोर्ट देखें',
      inviteTeam: 'टीम सदस्य आमंत्रित करें',
    },
    pages: {
      documents: {
        title: 'दस्तावेज़',
        description: 'अपने दस्तावेज़ प्रबंधित करें',
        placeholder: 'दस्तावेज़ सामग्री यहां आती है।',
      },
      analytics: {
        title: 'विश्लेषण',
        description: 'अपने विश्लेषण देखें',
        placeholder: 'विश्लेषण सामग्री यहां आती है।',
      },
      team: {
        title: 'टीम',
        description: 'अपनी टीम प्रबंधित करें',
        placeholder: 'टीम प्रबंधन सामग्री यहां आती है।',
      },
      settings: {
        title: 'सेटिंग्स',
        description: 'अपनी सेटिंग्स प्रबंधित करें',
        placeholder: 'सेटिंग्स सामग्री यहां आती है।',
      },
    },
  },
  team: {
    title: 'टीम',
    description: 'वर्कस्पेस सदस्य',
    inviteMember: 'सदस्य आमंत्रित करें',
    seatLimitReached:
      'सीट सीमा पहुंच गई — अधिक सदस्यों को आमंत्रित करने के लिए अपना प्लान अपग्रेड करें।',
    cards: {
      members: 'सदस्य',
      includedSeats: 'शामिल सीटें',
      maxUsers: 'अधिकतम उपयोगकर्ता',
      availableSeats: 'उपलब्ध सीटें',
    },
    memberList: {
      title: 'सदस्य',
      count: 'इस वर्कस्पेस में {count} सदस्य',
      empty: 'कोई सदस्य लोड नहीं हुए। सुनिश्चित करें कि आप प्रमाणित हैं।',
      roleFallback: 'सदस्य',
      changeRole: 'भूमिका बदलें',
    },
    invite: {
      title: 'ईमेल से आमंत्रित करें',
      description:
        'पते का खाता होना ज़रूरी नहीं। उन्हें ईमेल मिलता है, लिंक खोलते हैं, साइन अप या इन करते हैं और स्वीकार करते हैं।',
      noPermission: 'आपकी भूमिका सदस्यों को आमंत्रित नहीं कर सकती।',
      emailPlaceholder: 'name@company.com',
      role: 'भूमिका',
      send: 'आमंत्रण भेजें',
      sent: '{email} को आमंत्रण भेजा गया',
      failed: 'कुछ गलत हो गया',
      resent: 'आमंत्रण फिर भेजा गया',
      revoked: 'आमंत्रण रद्द किया गया',
      seatNote: '{count} लंबित आमंत्रण जवाब मिलने तक सीट रोके रखते हैं।',
      pendingTitle: 'लंबित',
      loading: 'लोड हो रहा है…',
      none: 'कुछ लंबित नहीं।',
      invitedBy: '{name} द्वारा आमंत्रित',
      pendingLabel: 'लंबित',
      expires: '{date} को समाप्त',
      cooldown: '{seconds} सेकंड में फिर भेज सकेंगे',
      resend: 'फिर भेजें',
      revoke: 'रद्द करें',
    },
    roleChanged: 'भूमिका बदलकर {role} की गई',
    manage: {
      title: 'सदस्य प्रबंधित करें',
      description:
        'भूमिकाएं और आमंत्रण प्रबंधित करने के लिए सेटिंग्स पैनल खोलें',
      openSettings: 'सदस्य सेटिंग्स खोलें',
      permissions: 'अनुमतियां',
    },
  },
  settings: {
    title: 'सेटिंग्स',
    description: 'वर्कस्पेस कॉन्फ़िगरेशन',
    card: {
      title: 'वर्कस्पेस सेटिंग्स',
      description: 'सेटिंग्स पैनल खोलने के लिए किसी भी अनुभाग पर क्लिक करें',
    },
    danger: {
      openButton: 'खतरे का ज़ोन खोलें',
    },
    sections: {
      security: {
        label: 'सुरक्षा',
        description: 'पासकी और आप कैसे साइन इन करते हैं',
      },
      devices: {
        label: 'डिवाइस',
        description: 'वे ब्राउज़र और मशीनें जिन पर आप साइन इन हैं',
      },
      'connected-agents': {
        label: 'जुड़े हुए एजेंट',
        description: 'वे AI एजेंट जिन्हें आपने MCP पर पहुँच दी है',
      },
      profile: {
        label: 'प्रोफ़ाइल',
        description: 'आपका नाम, अवतार और व्यक्तिगत डेटा',
      },
      general: {
        label: 'सामान्य',
        description: 'वर्कस्पेस नाम, स्लग और बुनियादी कॉन्फ़िगरेशन',
      },
      users: {
        label: 'सदस्य और आमंत्रण',
        description: 'टीम सदस्य, भूमिकाएं और लंबित आमंत्रण प्रबंधित करें',
      },
      subscription: {
        label: 'सदस्यता',
        description: 'अपना वर्तमान प्लान देखें और बदलें',
      },
      usage: {
        label: 'उपयोग',
        description: 'कोटा उपभोग और उपयोग इतिहास',
      },
      credits: {
        label: 'क्रेडिट',
        description: 'क्रेडिट बैलेंस और रिचार्ज विकल्प',
      },
      features: {
        label: 'फ़ीचर फ़्लैग',
        description: 'वर्कस्पेस सुविधाएं सक्षम/अक्षम करें',
      },
      notifications: {
        label: 'सूचनाएं',
        description: 'ईमेल और पुश सूचना प्राथमिकताएं',
      },
      permissions: {
        label: 'अनुमतियां',
        description: 'भूमिका-आधारित एक्सेस नियंत्रण कॉन्फ़िगरेशन',
      },
      danger: {
        label: 'खतरे का ज़ोन',
        description: 'वर्कस्पेस हटाएं या स्वामित्व स्थानांतरित करें',
      },
    },
  },
  invoices: {
    title: 'चालान',
    description: 'बिलिंग इतिहास',
    refresh: 'रीफ्रेश करें',
    billingPortal: 'बिलिंग पोर्टल',
    billingPortalOpening: 'खुल रहा है…',
    error: 'चालान लोड करने में त्रुटि।',
    card: {
      title: 'चालान इतिहास',
      found: '{count} चालान मिले',
      empty:
        'अभी कोई चालान नहीं। भुगतान प्लान की सदस्यता के बाद चालान यहां दिखाई देंगे।',
    },
    table: {
      date: 'दिनांक',
      amount: 'राशि',
      status: 'स्थिति',
      description: 'विवरण',
      links: 'लिंक',
      view: 'देखें',
      pdf: 'PDF',
      loadMore: 'और लोड करें',
    },
  },
  notifications: {
    title: 'सूचनाएँ',
    description: 'इस ऐप से एक सूचना भेजें और देखें कि वह कहाँ पहुँचती है',
    pushCard: {
      title: 'ब्राउज़र पुश सूचनाएं',
      description: 'इस डिवाइस के लिए ब्राउज़र पुश सूचनाएं सक्षम करें',
      subscribed: 'सदस्य',
      notSubscribed: 'सदस्य नहीं',
      subscribe: 'सदस्यता लें',
      unsubscribe: 'सदस्यता रद्द करें',
    },
    sendCard: {
      title: 'परीक्षण सूचना भेजें',
      description:
        'फ़ील्ड भरें और सूचना भेजें। {{name}}, {{workspaceName}}, {{url}} लेबल स्वचालित रूप से हल होते हैं।',
    },
    fields: {
      eventSlug: 'इवेंट स्लग',
      eventSlugHint:
        'डेमो इवेंट "{slug}" है, जो कंसोल में ईमेल और पुश के साथ पंजीकृत है। सिर्फ़ पुश के लिए कोई भी स्लग चलेगा; ईमेल के लिए पंजीकृत इवेंट चाहिए।',
      title: 'शीर्षक',
      message: 'संदेश',
      url: 'URL',
      target: 'प्राप्तकर्ता',
      channel: 'चैनल',
    },
    placeholders: {
      eventSlug: 'जैसे comment_added, deployment_success',
      title: 'सूचना शीर्षक',
      message: 'Push बॉडी + ईमेल संदेश',
      url: 'Push क्लिक पर खुलता है',
    },
    buttons: {
      meOnly: 'केवल मैं',
      allMembers: 'सभी वर्कस्पेस सदस्य',
      both: 'दोनों',
      emailOnly: 'केवल ईमेल',
      pushOnly: 'केवल Push',
      showAdvanced: 'उन्नत Push विकल्प दिखाएं',
      hideAdvanced: 'उन्नत Push विकल्प छुपाएं',
      send: 'सूचना भेजें',
      sending: 'भेजा जा रहा है...',
      silent: 'साइलेंट',
      requireInteraction: 'इंटरैक्शन आवश्यक',
      renotify: 'पुनः सूचित करें',
      default: 'डिफ़ॉल्ट',
    },
    advanced: {
      media: 'मीडिया',
      behavior: 'Push व्यवहार',
      delivery: 'डिलीवरी',
      actions: 'एक्शन बटन (अधिकतम 2)',
      iconUrl: 'आइकन URL',
      imageUrl: 'छवि URL',
      badgeUrl: 'बैज URL',
      tag: 'टैग',
      tagHint: 'स्टैक करने के बजाय एक ही टैग वाली सूचना बदलें',
      behaviorHint:
        'साइलेंट = कोई ध्वनि नहीं। इंटरैक्शन आवश्यक = उपयोगकर्ता एक्शन तक रहे। पुनः सूचित = बदलने पर ध्वनि।',
      urgency: 'तात्कालिकता',
      ttl: 'TTL (सेकंड)',
      schedule: 'शेड्यूल करें (ISO 8601)',
      action1: 'एक्शन 1',
      action2: 'एक्शन 2',
      actionTitlePlaceholder: 'बटन लेबल (जैसे Reply)',
      actionKeyPlaceholder: 'एक्शन कुंजी (जैसे reply)',
      iconUrlPlaceholder: 'Push आइकन (संगठन आइकन पर वापस जाता है)',
      imageUrlPlaceholder: 'Push बॉडी में बड़ी छवि',
      badgeUrlPlaceholder: 'स्टेटस बार आइकन (Android)',
      ttlPlaceholder: '86400 (डिफ़ॉल्ट 24 घंटे)',
    },
    context: {
      workspace: 'वर्कस्पेस:',
      user: 'उपयोगकर्ता:',
      none: 'कोई नहीं चुना',
    },
    resultCard: {
      title: 'प्रतिक्रिया',
      description: 'प्लेटफ़ॉर्म ने इस भेजने के साथ क्या किया।',
      openInbox: 'इनबॉक्स खोलें',
    },
    toast: {
      workspaceRequired: 'पहले एक वर्कस्पेस चुनें',
      sent: '{count} उपयोगकर्ता(ओं) को सूचना भेजी गई',
      notSent: 'सूचना नहीं भेजी गई: {reason}',
      inboxHint: 'घंटी और अपना इनबॉक्स देखें।',
      pushEnabled: 'Push सूचनाएं सक्षम',
      pushDisabled: 'Push सूचनाएं अक्षम',
      pushFailed: 'Push सूचनाएं बदलने में त्रुटि',
      networkError: 'नेटवर्क त्रुटि — सर्वर से कनेक्ट नहीं हो सका',
    },
  },
  profile: {
    agents: {
      title: 'जुड़े हुए एजेंट',
      description:
        'वे AI क्लाइंट जिन्हें आपने MCP पर अपनी ओर से काम करने की अनुमति दी है। डिस्कनेक्ट करने पर उनकी पहुँच रद्द हो जाती है।',
      guideTitle: 'एजेंट जोड़ें',
      guideDescription:
        'यह ऐप एक MCP सर्वर है। इसे Claude, Cursor या ChatGPT में जोड़ें और अपने BuildBase खाते से साइन इन करें; फिर एजेंट आपकी अनुमतियों के साथ आपके वर्कस्पेस और इस ऐप के दस्तावेज़ पढ़ता है।',
    },
    title: 'उपयोगकर्ता प्रोफ़ाइल',
    description: 'उपयोगकर्ता विशेषताएं और फ़ीचर फ़्लैग',
    identity: {
      title: 'पहचान',
      subtitle: 'useSaaSAuth() से',
      name: 'नाम',
      email: 'ईमेल पता',
      role: 'भूमिका',
      id: 'आईडी',
    },
    workspaceFeatures: {
      title: 'वर्कस्पेस फ़ीचर फ़्लैग',
      enabled: 'सक्षम',
      disabled: 'अक्षम',
    },
    attributes: {
      title: 'उपयोगकर्ता विशेषताएं',
      description: 'प्रति उपयोगकर्ता कस्टम की-वैल्यू जोड़े',
      empty: 'अभी कोई विशेषताएं कॉन्फ़िगर नहीं।',
      setTitle: 'विशेषता सेट करें (डेमो)',
      keyPlaceholder: 'कुंजी (जैसे theme)',
      valuePlaceholder: 'मूल्य',
      saving: 'सहेजा जा रहा है…',
      save: 'सहेजें',
      saved: 'सहेजा गया!',
      failed: 'सहेजने में विफल।',
    },
    userFeatures: {
      title: 'उपयोगकर्ता फ़ीचर फ़्लैग',
      description: 'उपयोगकर्ता स्तर के फ़ीचर फ़्लैग',
      empty: 'इस उपयोगकर्ता के लिए कोई फ़्लैग कॉन्फ़िगर नहीं।',
      loading: 'लोड हो रहा है...',
      enabled: 'सक्षम',
      disabled: 'अक्षम',
    },
  },
  pricing: {
    title: 'मूल्य निर्धारण',
    subtitle: 'अपनी जरूरतों के अनुसार प्लान चुनें',
    meta: {
      title: 'मूल्य निर्धारण',
      description: 'हमारे प्लान और मूल्य निर्धारण देखें',
    },
  },
  errors: {
    generic: {
      title: 'कुछ गलत हुआ',
      description:
        'एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें या समस्या बनी रहने पर सहायता से संपर्क करें।',
      tryAgain: 'पुनः प्रयास करें',
      goHome: 'होम पर जाएं',
    },
    notFound: {
      title: 'पृष्ठ नहीं मिला',
      description:
        'क्षमा करें, हम वह पृष्ठ नहीं ढूंढ सके जिसे आप ढूंढ रहे हैं। इसे स्थानांतरित या हटाया जा सकता है।',
      goBack: 'वापस जाएं',
    },
    blogNotFound: {
      title: 'पोस्ट नहीं मिली',
      description:
        'जिस ब्लॉग पोस्ट को आप ढूंढ रहे हैं वह मौजूद नहीं है, हटाई जा सकती है, या आपकी भाषा में उपलब्ध नहीं है।',
      browseAll: 'सभी पोस्ट देखें',
    },
  },
  blog: {
    label: 'ब्लॉग',
    heading: 'नवीनतम पोस्ट',
    description: 'हमारी टीम से अपडेट, ट्यूटोरियल और अंतर्दृष्टि।',
    noPosts: 'अभी कोई पोस्ट नहीं। जल्द वापस आएं!',
    noPostsTag: 'इस टैग के साथ अभी कोई पोस्ट नहीं।',
    noPostsCategory: 'इस श्रेणी में अभी कोई पोस्ट नहीं।',
    noPostsAuthor: 'इस लेखक की अभी कोई पोस्ट नहीं।',
    postsByAuthor: '{name} की पोस्ट',
    postsTaggedCount: '"{tag}" टैग वाली {count} पोस्ट',
    postsInCategoryCount: 'इस श्रेणी में {count} पोस्ट',
    readMore: 'और पढ़ें',
    read: 'पढ़ें',
    allPosts: '← सभी पोस्ट',
    previous: 'पिछला',
    next: 'अगला',
    pageOf: 'पृष्ठ {page} / {total}',
    relatedPosts: 'संबंधित पोस्ट',
    share: 'साझा करें',
    rssLabel: 'RSS फ़ीड',
    shareAriaX: 'X / Twitter पर शेयर करें',
    shareAriaLinkedin: 'LinkedIn पर शेयर करें',
    shareAriaFacebook: 'Facebook पर शेयर करें',
    shareAriaCopy: 'लिंक कॉपी करें',
    shareAriaCopied: 'लिंक कॉपी हो गया!',
    search: {
      trigger: 'पोस्ट खोजें...',
      placeholder: 'ब्लॉग पोस्ट खोजें...',
      searching: 'खोज रहा है...',
      noResults: '"{query}" के लिए कोई परिणाम नहीं',
      startTyping: 'खोजने के लिए टाइप करना शुरू करें...',
    },
    meta: {
      title: 'ब्लॉग',
      titlePage: 'ब्लॉग — पृष्ठ {page}',
      description: 'हमारी टीम से नवीनतम पोस्ट, ट्यूटोरियल और अपडेट।',
      tagTitle: '"{tag}" टैग वाली पोस्ट',
      tagDescription: '"{tag}" टैग वाली सभी ब्लॉग पोस्ट।',
      categoryTitle: '{category} — ब्लॉग',
      categoryDescription: '"{category}" श्रेणी की ब्लॉग पोस्ट।',
    },
  },
  changelog: {
    label: 'परिवर्तन लॉग',
    heading: 'नया क्या है',
    description: 'सभी नवीनतम अपडेट, सुधार और फ़िक्स।',
    rssLabel: 'RSS फ़ीड',
    permalink: 'स्थायी लिंक',
    meta: {
      title: 'परिवर्तन लॉग',
      description: 'सभी नवीनतम अपडेट, सुधार और फ़िक्स।',
    },
  },
  inbox: {
    title: 'इनबॉक्स',
    description:
      'इस ऐप ने आपको जो कुछ भेजा है, हर सूचना के लिए एक आइटम, चाहे वह कैसे भी पहुँची हो।',
    rules: {
      live: 'नए आइटम सॉकेट पर लाइव आते हैं; रीलोड की ज़रूरत नहीं।',
      read: 'आइटम तब पढ़ा माना जाता है जब आप उसे यहाँ खोलें या उसका लिंक क्लिक करें। सिर्फ़ ईमेल खोलने से नहीं।',
      email:
        'हर आइटम दिखाता है कि ईमेल और पुश ने क्या किया, ताकि पता चले कोई चैनल चुप क्यों रहा।',
    },
  },
  help: {
    title: 'सहायता केंद्र',
    description:
      'इस पृष्ठ की हर चीज़ कंसोल में लिखी गई है: नीति, दस्तावेज़, सामान्य प्रश्न और प्रशंसापत्र। वहाँ बदलें, यहाँ रीलोड करें।',
    notConfigured: {
      title: 'अभी कोई सामग्री नहीं',
      token:
        'इस ऐप के पास संगठन API टोकन नहीं है, इसलिए यह कंसोल सामग्री नहीं पढ़ सकता। BUILDBASE_API_TOKEN सेट करें।',
      empty: 'संगठन में अभी डेमो सामग्री नहीं है। इससे सीड करें:',
    },
    from: {
      richContent: 'रिच कंटेंट',
      docs: 'डॉक्स',
      faqs: 'FAQ संग्रह',
      testimonials: 'प्रशंसापत्र',
    },
    docs: {
      title: 'दस्तावेज़',
      empty: 'अभी कोई प्रकाशित दस्तावेज़ नहीं।',
    },
    faq: {
      title: 'अक्सर पूछे जाने वाले प्रश्न',
    },
    testimonials: {
      title: 'ग्राहक क्या कहते हैं',
    },
  },
  waitlist: {
    title: 'प्रतीक्षा सूची में शामिल हों',
    description:
      'प्लेटफ़ॉर्म का बीटा फ़ॉर्म: नाम और ईमेल दें, एडमिन कंसोल में आपको स्वीकृत करेगा।',
    success: 'आप सूची में हैं। एडमिन कंसोल से आपको स्वीकृत करेगा।',
    note: 'फ़ॉर्म और उसका पाठ संगठन की बीटा कॉन्फ़िगरेशन से आता है (कंसोल → Users → Beta)।',
  },
  account: {
    exports: {
      csv: 'CSV निर्यात करें',
      locked: 'निर्यात',
      lockedHint:
        'निर्यात सशुल्क प्लान का हिस्सा है। अनलॉक करने के लिए प्लान चुनें।',
    },
    creditPacks: {
      title: 'क्रेडिट पैक',
      description:
        'किसी भी प्लान को टॉप-अप करें। क्रेडिट से दस्तावेज़ बनाना और AI क्रियाएँ होती हैं।',
      credits: '{count} क्रेडिट',
    },
    permissions: {
      title: 'आपके संगठन की अनुमतियाँ',
      description:
        'BuildBase कंसोल में परिभाषित और भूमिका के अनुसार दी गई कुंजियाँ, कस्टम भूमिकाओं सहित। दस्तावेज़ इन्हें सर्वर पर भी जाँचते हैं।',
      empty:
        'इस संगठन ने अभी अपनी अनुमतियाँ परिभाषित नहीं की हैं। npm run seed:org चलाएँ, या कंसोल में Workspace settings → Permissions में कुंजियाँ जोड़ें।',
    },
    security: {
      title: 'सुरक्षा',
      description:
        'जहाँ भी आप साइन इन हैं, जिन डिवाइस पर आप भरोसा करते हैं, और उन्हें समाप्त करने के तरीके।',
      sessions: {
        title: 'सत्र',
        description:
          'हर साइन-इन प्लेटफ़ॉर्म पर एक सत्र है। किसी को साइन आउट करें और वह हर जगह तुरंत बंद हो जाता है।',
        signOut: 'साइन आउट',
        empty: 'कोई अन्य सत्र नहीं।',
      },
      devices: {
        title: 'डिवाइस',
        description:
          'वे ब्राउज़र और मशीनें जिनसे आपने साइन इन किया है। भरोसेमंद डिवाइस अतिरिक्त जाँच छोड़ देता है।',
        signOut: 'साइन आउट',
        empty: 'अभी कोई डिवाइस नहीं।',
      },
      everywhere: {
        title: 'हर जगह से साइन आउट',
        description:
          'आपके हर डिवाइस पर हर सत्र समाप्त करता है, इसमें यह भी शामिल है।',
        button: 'हर जगह से साइन आउट',
        failed: 'हर जगह से साइन आउट नहीं हो सका। फिर से प्रयास करें।',
        confirmTitle: 'हर डिवाइस से साइन आउट करें?',
        confirmBody:
          'हर डिवाइस पर हर सत्र अभी समाप्त होगा, और आपको यहाँ भी फिर से साइन इन करना होगा।',
        cancel: 'रद्द करें',
        working: 'साइन आउट हो रहा है…',
      },
      passkeys: {
        title: 'पासकी',
        description:
          'फ़िंगरप्रिंट, चेहरे या डिवाइस PIN से साइन इन करें। पासकी होस्टेड साइन-इन डोमेन पर पंजीकृत होती हैं, इसलिए यह उसके लिए SDK स्क्रीन खोलता है।',
        button: 'पासकी प्रबंधित करें',
      },
      agents: {
        title: 'जुड़े हुए एजेंट',
        description:
          'वे AI एजेंट जिन्हें आपने MCP पर पहुँच दी है। अपनी प्रोफ़ाइल पर उनकी समीक्षा करें और रद्द करें।',
        button: 'प्रोफ़ाइल खोलें',
      },
    },
    invitations: {
      title: 'आपके लिए प्रतीक्षारत आमंत्रण',
      description:
        'वे वर्कस्पेस जिन्होंने आपको आमंत्रित किया है। स्वीकार करने पर आप उस वर्कस्पेस में चले जाते हैं।',
    },
    subscription: {
      cancel: 'प्लान रद्द करें',
      canceling: 'रद्द हो रहा है…',
      resume: 'प्लान जारी रखें',
      resuming: 'फिर से शुरू हो रहा है…',
      endsOn: '{date} को समाप्त',
      canceled: 'प्लान इस अवधि के अंत में समाप्त होगा।',
      resumed: 'प्लान जारी रहेगा।',
      failed: 'यह काम नहीं किया। फिर से प्रयास करें।',
    },
    invoice: {
      details: 'विवरण',
      title: 'इनवॉइस {number}',
      loading: 'इनवॉइस लोड हो रहा है…',
      missing: 'इनवॉइस नहीं मिला।',
      status: 'स्थिति',
      amountDue: 'देय राशि',
      amountPaid: 'भुगतान की गई राशि',
      created: 'जारी',
      due: 'देय तिथि',
      note: 'टिप्पणी',
      open: 'होस्टेड इनवॉइस खोलें',
      pdf: 'PDF डाउनलोड करें',
    },
    preferences: {
      title: 'आपकी सूचना प्राथमिकताएँ',
      description:
        'हर इवेंट के लिए चुनें कि वह आप तक ईमेल से पहुँचे या पुश से। जो आप नहीं बदलते, वह वर्कस्पेस के डिफ़ॉल्ट का पालन करता है।',
      loading: 'आपकी प्राथमिकताएँ लोड हो रही हैं…',
      empty:
        'इस वर्कस्पेस में अभी कोई सूचना इवेंट नहीं है। नीचे से एक भेजें और वह यहाँ दिखेगा।',
      failed: 'आपकी प्राथमिकताएँ सहेजी नहीं जा सकीं।',
      saved: 'प्राथमिकता सहेजी गई।',
      required:
        'यह इवेंट इस वर्कस्पेस में अनिवार्य है और बंद नहीं किया जा सकता।',
      requiredBadge: 'अनिवार्य',
      email: 'ईमेल',
      push: 'पुश',
      useDefault: 'वर्कस्पेस डिफ़ॉल्ट का उपयोग करें',
      refresh: 'रीफ़्रेश करें',
    },
    console: {
      title: 'टेम्पलेट से शुरू करें',
      description:
        'BuildBase कंसोल में तैयार सेट। किसी एक की कॉपी बनाएँ और वह भरा हुआ आपके संगठन में आ जाता है।',
      workflowTemplates: {
        title: 'वर्कफ़्लो टेम्पलेट',
        description:
          'दस वर्कफ़्लो: ट्रायल समाप्त, भुगतान विफल, फ़ॉर्म से वेबहुक, CRM सिंक और भी बहुत कुछ।',
      },
      emailLibrary: {
        title: 'ईमेल टेम्पलेट लाइब्रेरी',
        description: 'सौ से अधिक ईमेल टेम्पलेट, हर प्लान पर मुफ़्त।',
      },
    },
  },
};

export default messages;
