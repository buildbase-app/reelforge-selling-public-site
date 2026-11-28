import { companyAddressLine, siteConfig } from '@/config/site';
import type { LegalPageContent } from '../page-loader';

const { company, contact } = siteConfig;

/** The terms page, English. The body is Markdown, rendered on the server. */
const page: LegalPageContent = {
  locale: 'en',
  heroEyebrow: 'Legal',
  heroTitle: 'Terms of Service',
  heroDescription:
    'The terms for using this website, your account and the store. Draft, pending review.',
  lastUpdated: '2026-11-27',
  pendingReview: true,
  body: `These terms are an agreement between you and **${company.legalName}** ("we", "us"), ${companyAddressLine}, which develops, maintains and sells RenderWeld. They cover this website, your account on it, and buying from the store. By creating an account, claiming a licence key or buying, you agree to them. If you use RenderWeld for an organisation, you agree for that organisation and confirm you may do so.

What you may do with the RenderWeld software itself is set by its [licences](/licence), not by these terms. Paid purchases are also covered by the [refund policy](/refund), and personal data by the [privacy policy](/privacy).

## 1. Your account

- Give accurate details and keep them up to date.
- Keep your sign-in secure. You are responsible for what happens under your account; tell us at once at [${contact.support}](mailto:${contact.support}) if you think someone else has used it.
- One person per account. You must be at least 16, and old enough to enter a contract where you live.
- You can delete your account at any time by emailing [${contact.privacy}](mailto:${contact.privacy}).

## 2. Licence keys and the software

- RenderWeld is **source-available**: anyone may read its code, and the [licences](/licence) say who may run it and how. The free Personal licence is for noncommercial use only; any commercial use needs a paid Commercial licence.
- Licence keys are issued to the buyer named on the order, whether or not they have an account. Do not share, sell, publish or transfer a key, and do not use a free Personal key for commercial work.
- Do not move, disable, circumvent or remove the licence-key check, in the released images or in a modified copy.
- RenderWeld runs on your own machine or server. You are responsible for that machine, for backups, and for any third-party services you connect to it (AI providers, storage, voice services), which are governed by their own terms.

## 3. Buying

- Prices are shown on the [pricing page](/pricing) before you pay, with any tax added at checkout. Payments are processed by Stripe.
- A Commercial licence is a one-time purchase for the tier you choose. It is delivered as a licence key in your account as soon as the payment succeeds.
- Refunds follow the [refund policy](/refund). Nothing in these terms limits the rights you have as a consumer where you live.
- We may change prices for future purchases; a change never affects a licence you already bought.

## 4. Acceptable use

When you use this website, your account and our services, do not:

- break the law, or infringe anyone's intellectual property, privacy or other rights;
- try to get into accounts, data or systems that are not yours, or probe, scan or test our systems for weaknesses except as our [security.txt](/security.txt) allows;
- overload, disrupt or attack the site, or scrape it in ways that ignore its robots rules or rate limits;
- abuse free offers, for example by creating many accounts to claim many free keys;
- send spam, phishing or malware through anything we run, or impersonate anyone;
- resell, sublicense or offer access to our services, or present yourself as us.

The videos you make with RenderWeld are your responsibility: do not use it to make content that is illegal, that infringes others' rights, or that deceives people in harmful ways (for example impersonating a real person without consent).

We may suspend or close an account that breaks these rules, after a warning where that is reasonable.

## 5. Your content

The videos, projects, prompts and files you make with RenderWeld are yours; we claim no rights in them, and they stay on your own machine. If you send us feedback or ideas, we may use them to improve RenderWeld without owing you anything.

## 6. Our intellectual property

RenderWeld's code, documentation and this website are owned by ${company.legalName} and are licensed to you only as the [licences](/licence) and these terms say. "RenderWeld" and its logo are trademarks of ${company.legalName}; you may say, truthfully, that your work uses RenderWeld, but you may not use the name or logo for a fork, product, service or domain.

## 7. Third-party services and software

The store runs on BuildBase (accounts, orders, licence keys, content), Stripe (payments) and Cloudflare (hosting). RenderWeld includes third-party components under their own licences, including Remotion, which has its own licence terms for larger companies; the [licences page](/licence) explains this. We are not responsible for services we do not run.

## 8. Availability and changes

We work to keep the site and the licence-key service available but do not promise they will be uninterrupted or error-free; maintenance and outages happen. We may change or stop features of the website.

## 9. Disclaimers

Except as the law requires and as your licence says, the website, the services and RenderWeld are provided **as is** and **as available**, without warranties of any kind, express or implied, including fitness for a particular purpose and non-infringement.

## 10. Limitation of liability

To the extent the law allows, ${company.legalName} is not liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, revenue, data or goodwill. Our total liability for any claim about the website, the services or RenderWeld is limited to the greater of what you paid us in the 12 months before the claim and 100 US dollars. These limits do not apply where the law does not allow them, for example for fraud, or for death or personal injury caused by negligence.

## 11. Ending this agreement

You can stop using the site and delete your account at any time. We may suspend or end your account if you seriously or repeatedly break these terms, or if the law requires it. What you already paid for is handled under the [refund policy](/refund) and your [licence](/licence). Sections that by their nature should survive (such as 5, 6, 9, 10 and 12) continue after the agreement ends.

## 12. Governing law and disputes

These terms are governed by the laws of the State of Wyoming, United States, without regard to its conflict-of-law rules, and disputes are resolved in the state or federal courts located in Wyoming. If you are a consumer, you also keep the protection of the mandatory laws of the country where you live and may bring a claim there.

## 13. Changes to these terms

When we change these terms we update the date at the top. If a change is significant, we tell account holders by email or on the site before it takes effect. If you keep using the site after that, the new terms apply; if you do not agree, you can delete your account.

## 14. Contact

Questions about these terms or the licences: [${contact.legal}](mailto:${contact.legal}). ${company.legalName}, ${companyAddressLine}.
`,
};

export default page;
