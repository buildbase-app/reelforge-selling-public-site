import { companyAddressLine, siteConfig } from '@/config/site';
import type { LegalPageContent } from '../page-loader';

const { company, contact, repo } = siteConfig;

/** The about page, English. The body is Markdown, rendered on the server. */
const page: LegalPageContent = {
  locale: 'en',
  heroEyebrow: 'Company',
  heroTitle: 'About RenderWeld',
  heroDescription:
    'Who makes RenderWeld, what it is for, and how it is built and sold.',
  seoTitle: 'About',
  seoDescription:
    'RenderWeld is a source-available video renderer that AI agents drive over REST and MCP, developed and maintained by Jagodana LLC.',
  lastUpdated: '2026-11-27',
  body: `RenderWeld is a source-available video renderer that you host yourself. Your AI agent drives it over REST and MCP: the agent writes every scene and its timing, and RenderWeld renders them with Remotion, Motion Canvas, HTML and HyperFrames at the size and frame rate you ask for.

## Who makes it

RenderWeld is developed and maintained by ${company.maintainer} at **${company.legalName}**, ${companyAddressLine}. ${company.legalName} also sells the licences on this site.

## How it works for you

- **It runs on your machine.** You install RenderWeld on your own computer or server. Your videos, prompts, projects and API keys stay there; the only thing sent to us is a licence-key check.
- **Your agent does the work.** Any MCP client can drive it, and the REST API covers the same ground, so the videos come from the tools you already use.
- **The code is public.** Anyone can read the source on [GitHub](${repo.url}). The free Personal licence covers noncommercial use; commercial use needs a one-time Commercial licence. The [licences page](/licence) explains both.

## How this site is built

The store runs on [BuildBase](https://www.buildbase.app) for sign-in, orders, licence keys and content, takes payments through Stripe, and is hosted on Cloudflare. The [privacy policy](/privacy) says what each of them processes.

## Get in touch

Questions about RenderWeld or your licence: [${contact.support}](mailto:${contact.support}). Everything else, including partnerships and press: [${contact.general}](mailto:${contact.general}). The [contact page](/contact) lists every address.
`,
};

export default page;
