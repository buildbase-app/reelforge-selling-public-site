import { siteConfig } from '@/config/site';
import type { LegalPageContent } from '../page-loader';

const { company, contact } = siteConfig;

/** The licence page, English. The body is Markdown, rendered on the server. */
const page: LegalPageContent = {
  locale: 'en',
  heroEyebrow: 'Legal',
  heroTitle: 'RenderWeld licences',
  heroDescription:
    'RenderWeld is source-available under two licences, a free Personal licence for noncommercial use and a paid Commercial licence. A summary; the full texts are linked. Draft, pending review.',
  seoTitle: 'Licences',
  seoDescription:
    'RenderWeld is source-available. Free for noncommercial use under the PolyForm Noncommercial License 1.0.0; any commercial use needs the RenderWeld Commercial License. Summary, draft pending review.',
  lastUpdated: '2026-11-27',
  pendingReview: true,
  body: `RenderWeld is **source-available**: anyone can read its code on [GitHub](https://github.com/buildbase-app/reelforge-studio). It is developed, maintained and licensed by **${company.legalName}**. What you may do with it depends on how you use it. This page summarises the two licences; the full texts in the repository are what apply. Nothing here is legal advice.

| You want to…                                                                                            | You need                                                                                 |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Read the code, learn from it, or run it for yourself as a hobby, for study, research or evaluation      | The free **Personal** licence (a Personal licence key, claimed with a BuildBase account) |
| Make videos for anything that earns money: a monetised channel, client work, ads, a business, an agency | A paid **Commercial** licence                                                            |
| Charity, school, public research or government use, noncommercially                                     | The free **Personal** licence                                                            |
| Resell, rebrand, redistribute, or offer RenderWeld (or a modified copy) as a product or hosted service   | Not permitted under either licence                                                       |
| Use the name "RenderWeld" or its logo for a fork or product                                              | Not permitted: forks must be renamed                                                     |

Every released RenderWeld Docker image activates with a licence key from BuildBase: a free Personal key or a paid Commercial key. Only the key and a random instance id are sent.

## Personal licence: PolyForm Noncommercial 1.0.0

The Personal licence is the **PolyForm Noncommercial License 1.0.0**, unmodified. Read the [canonical text](https://polyformproject.org/licenses/noncommercial/1.0.0/) or the copy in the repository, [LICENSE.md](https://github.com/buildbase-app/reelforge-studio/blob/main/LICENSE.md).

In short:

- You may use, change and share RenderWeld for any **noncommercial** purpose: personal use, hobby projects, study, research and evaluation, and use by charities, schools, public research bodies and government institutions.
- Anyone you share it with must get the licence terms and the \`Required Notice:\` lines from the repository's [NOTICE](https://github.com/buildbase-app/reelforge-studio/blob/main/NOTICE).
- It includes a patent licence, gives you 32 days to fix a violation after notice, and comes with no warranty.
- The Personal licence key is free; you claim it on the [pricing page](/pricing) with a BuildBase account. It is for noncommercial use only.

## Commercial licence

> **Draft – pending review.** The RenderWeld Commercial License is a plain-language draft that a lawyer must review before launch. Full draft: [COMMERCIAL-LICENSE.md](https://github.com/buildbase-app/reelforge-studio/blob/main/COMMERCIAL-LICENSE.md).

Between **${company.legalName}** and the person or organisation that buys a Commercial licence. In short:

1. **Grant.** While your licence is valid, a non-exclusive, non-transferable licence to install, run and modify RenderWeld for your own commercial purposes, on up to the number of instances (servers, machines or containers) your licence key allows.
2. **Licence key.** Each running instance activates with your key through BuildBase. You must not move, change, disable, circumvent or remove the licence-key check.
3. **Not permitted.** Selling, reselling, sublicensing, renting, lending or redistributing RenderWeld or a modified copy, in source or binary form; offering it, or a product that substantially provides its functionality, to others as a hosted, managed or embedded service; using it to build a competing product; removing copyright, licence or trademark notices.
4. **Your content.** The videos and projects you make are yours.
5. **Modifications.** You may modify RenderWeld for your own use; modifications stay under the same limits.
6. **Updates.** Included for **12 months** from purchase unless your plan says otherwise; after that, the version you have keeps working.
7. **Third-party software** keeps its own licences, including Remotion's (see below).
8. **Termination.** If you breach the licence and do not fix it within 30 days of written notice, it ends and you must stop using RenderWeld. Refunds follow the [refund policy](/refund).
9. **No warranty.** Provided as is; liability is limited to what you paid for the licence, to the extent the law allows.
10. **Governing law.** The laws of the State of Wyoming, United States, with the courts of Wyoming, as in the [terms of service](/terms).

Commercial licences are sold on the [pricing page](/pricing), one-time, in tiers that differ by how many servers the key allows. Every tier runs the same code.

## What counts as commercial use

Any use by or for a business, or any use meant to earn money, directly or indirectly: videos for a monetised social account, client or agency work, marketing for a business, use inside a company, or as part of a paid product or service. When in doubt, it is commercial, or [ask us](/contact).

## Trademark

"RenderWeld" and the RenderWeld logo are trademarks of ${company.legalName} and are not licensed under either licence. You may say, truthfully, that your work uses or is based on RenderWeld. You may not use the name or logo for a fork, product, service or domain, and **forks must be renamed** and remove the logo. See the [trademark policy](https://github.com/buildbase-app/reelforge-studio/blob/main/TRADEMARK.md).

## Third-party software

RenderWeld's third-party components keep their own licences (listed in the repository's \`LICENSES/\` folder), and complying with them is your responsibility.

- **Remotion is not covered by either RenderWeld licence.** RenderWeld includes Remotion-based templates. Remotion is free for individuals and companies of up to 3 people; larger companies need their own Remotion licence ([remotion.dev/license](https://www.remotion.dev/license)). We do not sell or include a Remotion licence.
- **Other engines and tools.** RenderWeld also includes Motion Canvas, HTML and HyperFrames engines, each under its own licence.
- **AI providers.** Any AI service you connect is optional, uses your own account and key, and is governed by that provider's terms.

## Contact

Commercial, partner or licensing questions: [${contact.legal}](mailto:${contact.legal}), or see the [contact page](/contact). The full licensing overview is [LICENSING.md](https://github.com/buildbase-app/reelforge-studio/blob/main/LICENSING.md).
`,
};

export default page;
