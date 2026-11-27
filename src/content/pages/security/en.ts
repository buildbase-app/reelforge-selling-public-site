import { siteConfig } from '@/config/site';
import type { LegalPageContent } from '../page-loader';

const { repo } = siteConfig;

/** The security page, English. The body is Markdown, rendered on the server. */
const page: LegalPageContent = {
  locale: 'en',
  heroEyebrow: 'Trust',
  heroTitle: 'Security',
  heroDescription:
    'How RenderWeld keeps your work on your own machine, how this store protects your account and payments, and how to report a vulnerability.',
  seoTitle: 'Security',
  seoDescription:
    'How RenderWeld and its store handle security: self-hosted rendering, a minimal licence check, protected accounts and payments, and private vulnerability reporting.',
  lastUpdated: '2026-11-27',
  body: `## Your work stays on your machine

RenderWeld is self-hosted. Rendering happens on your own computer or server, and your videos, prompts, projects and the API keys of any AI provider you connect never reach us.

The one thing an install sends us is its licence-key check: your licence key and a random instance id, so a key runs on no more instances than it allows. You choose where to install RenderWeld and who can reach it, so keep it behind your own firewall or sign-in. The studio's [hardening guide](${repo.url}/blob/main/docs/security/HARDENING.md) lists the safe defaults and the settings to review before you expose an install to a network.

## Your account and payments on this store

- **Encrypted everywhere.** Every page is served over HTTPS, and browsers are told to use only HTTPS for this domain (HSTS).
- **Locked-down pages.** A strict Content Security Policy limits which scripts and sources a page may load, and no other site may embed our pages in a frame.
- **Sign-in by BuildBase.** Accounts and sign-in are run by BuildBase; this site keeps your session in a cookie that page scripts cannot read.
- **Cards by Stripe.** Card details go straight to Stripe. We never see or store your full card number.
- **Only what we need.** The [privacy policy](/privacy) lists what we collect and why.

## Reporting a vulnerability

Please report security problems privately, never in a public issue or discussion.

- **This website and store:** report it through [GitHub's private vulnerability reporting](https://github.com/buildbase-app/reelforge-selling-public-site/security/advisories/new).
- **The RenderWeld software:** follow the studio's [security policy](${repo.url}/blob/main/SECURITY.md).

Include what is affected, its impact, and how to reproduce it. We aim to acknowledge a report within three working days, agree a fix and disclosure timeline with you, and credit you if you wish. The same route is in this site's [security.txt](/security.txt).
`,
};

export default page;
