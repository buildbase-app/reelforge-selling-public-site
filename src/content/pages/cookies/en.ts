import { siteConfig } from '@/config/site';
import type { LegalPageContent } from '../page-loader';

const { company, contact } = siteConfig;

/** The cookie page, English. The body is Markdown, rendered on the server. */
const page: LegalPageContent = {
  locale: 'en',
  heroEyebrow: 'Legal',
  heroTitle: 'Cookie Policy',
  heroDescription:
    'Which cookies this website uses, what each one is for, and how to change your choice. Draft, pending review.',
  seoTitle: 'Cookie Policy',
  seoDescription:
    'The cookies the RenderWeld website uses, grouped by purpose, and how to change your cookie choice. Draft pending review.',
  lastUpdated: '2026-11-27',
  pendingReview: true,
  body: `This policy explains the cookies and similar storage that this website uses. It is part of our [privacy policy](/privacy), which says who we are (${company.legalName}) and how we handle personal data. The RenderWeld software you run on your own machine sets no cookies on this site.

## Your choice

The first time you visit, a banner asks which optional cookies you allow: **Reject all**, **Accept all**, or **Choose** between analytics and marketing. Both answers are equally easy to give, and the site works the same either way. Where the law asks for consent first (the EEA, the UK and Switzerland), no analytics or marketing cookie is set before you answer. You can change your answer at any time with **Cookie settings** at the foot of every page, or clear cookies in your browser.

## Strictly necessary

These make the site work and cannot be turned off here.

| Cookie | What it does | How long |
| --- | --- | --- |
| \`bb-session-id\` | Keeps you signed in to your account | 7 days |
| \`bb_consent\` | Remembers your cookie choice, so the banner does not ask again | Until you change it |
| \`bb_cid\` | A random id that files your cookie choice as proof of consent; set only when you answer | Set by BuildBase |
| \`NEXT_LOCALE\` | Remembers the language you picked, if you pick one | 1 year |
| \`sidebar_state\` | Remembers whether the sidebar in your dashboard is open | 7 days |

Signing in passes through BuildBase's sign-in pages, which set their own cookies to keep that step secure.

## Analytics

Set only after you allow analytics, where consent is needed.

- **BuildBase analytics** counts page views and how visitors arrive, using first-party cookies named \`bb_\` on this site. Before you answer, or if you refuse, a visit is counted without cookies or an identifier.
- **Analytics tools we switch on in BuildBase**, if any, are listed by name in the banner's **Choose** view before you decide, and set cookies only after you allow them.

**Cloudflare Web Analytics** measures page views and speed without cookies and without tracking you across sites.

## Marketing

Set only after you allow marketing, where consent is needed.

| Cookie | What it does | How long |
| --- | --- | --- |
| \`bb_attr\` | Remembers which campaign or ad link brought you here (UTM tags and ad click ids), so a later sign-up or purchase can be credited to it | 90 days |

Advertising tags we switch on, if any, are listed by name in the banner's **Choose** view, and set their own cookies only after you allow marketing.

## Other scripts

While RenderWeld takes part in the Ship or Die hackathon, public pages load a verification script from ship-or-die.com so the organisers can check the site's traffic; see the [privacy policy](/privacy).

## Changes and contact

When the cookies we use change, we update this page and its date. Questions: [${contact.privacy}](mailto:${contact.privacy}).
`,
};

export default page;
