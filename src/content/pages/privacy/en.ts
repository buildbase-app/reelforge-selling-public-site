import { companyAddressLine, siteConfig } from '@/config/site';
import type { LegalPageContent } from '../page-loader';

const { company, contact } = siteConfig;

/** The privacy page, English. The body is Markdown, rendered on the server. */
const page: LegalPageContent = {
  locale: 'en',
  heroEyebrow: 'Legal',
  heroTitle: 'Privacy Policy',
  heroDescription:
    'What personal data RenderWeld collects, why, who processes it, how long it is kept, and your rights. Draft, pending review.',
  lastUpdated: '2026-11-27',
  pendingReview: true,
  body: `This policy covers this website (the store, your account, the docs and the blog) and the licence-key check in the RenderWeld software. RenderWeld itself runs on your own computer or server: your videos, prompts, projects and API keys stay there and are never sent to us.

## In short

- **We do not sell your personal data**, and we do not share it for cross-site advertising.
- **We collect what we need** to sell, deliver and support a licence, and to keep the site running and secure.
- **Analytics and marketing cookies wait for your choice** in the cookie banner where the law asks for it.

## 1. Who is responsible

The controller of your personal data is **${company.legalName}**, ${companyAddressLine}. RenderWeld is developed and maintained by ${company.maintainer} at ${company.legalName}. Privacy questions and requests: [${contact.privacy}](mailto:${contact.privacy}).

## 2. What we collect

**What you give us**

- **Account data**: your name, email address and sign-in details when you create an account, to give you access to your account, orders, licence keys and downloads.
- **Waitlist entries**: the name and email you leave on the waitlist, to tell you when RenderWeld can be bought.
- **Order data**: what you bought, when, the amount, your billing country and the status of the payment, to deliver your purchase, keep accounting records and handle refunds. Card details go straight to Stripe; we never see your full card number.
- **Messages**: what you write to us by email or through a form, to answer you.
- **Notification settings**: which emails and push messages you want, and your browser's push subscription if you turn push on.

**What is collected when you use the site or the software**

- **Licence-key checks**: when a RenderWeld instance activates, it sends your licence key and a random instance id, so we can tell how many instances a key runs on. Nothing about your videos, prompts or files is sent.
- **Licence and download records**: the keys issued to you, where they are activated and how often files were downloaded, to deliver and protect your purchase.
- **Technical data**: IP address, browser, device and request logs created when you visit, to run and secure the site and stop abuse.
- **Usage analytics**: pages viewed and how you arrived (for example a campaign tag on the link), through BuildBase analytics. Where the law requires consent first (the EEA, the UK and Switzerland), a visit is counted without cookies or an identifier until you accept analytics in the cookie banner.

## 3. Why we use it, and on what basis

- **To provide what you asked for** (contract): your account, your order, your licence keys, downloads, support and refunds.
- **To run, secure and improve the site** (legitimate interest): logs, abuse prevention and aggregate usage statistics.
- **To keep records the law requires** (legal obligation): invoices, tax and accounting records.
- **To measure our marketing** (consent where required): analytics and advertising tags you accept in the cookie banner. You can change your answer at any time from the cookie settings link at the foot of every page.
- **To email you about RenderWeld** (consent, or legitimate interest for customers): product news and the waitlist. Every such email has an unsubscribe link. Order and account emails are part of the service and are sent while you have an account.

## 4. Who processes it for us

- **BuildBase**: sign-in, accounts, the waitlist, orders, licence keys, file delivery, email and push notifications, site content, consent records and analytics. BuildBase is also built and run by ${company.legalName}.
- **Stripe**: payments, tax calculation, fraud prevention and refunds. Stripe also acts as an independent controller for payment data under its own privacy policy.
- **Cloudflare**: hosting, the site's database, content delivery, protection against attacks, and Cloudflare Web Analytics, which counts page views and performance without cookies.

Analytics or advertising vendors that you accept in the cookie banner process data as independent controllers under their own policies; the banner lists each one before you choose. The [cookie policy](/cookies) lists the cookies.

While RenderWeld takes part in the Ship or Die hackathon, public pages (not order or account pages) load a verification script from ship-or-die.com so the organisers can check the site's traffic. It sends page-view information to Ship or Die under their own privacy information.

## 5. When we share it

We share personal data only with the processors above, when the law requires it (for example a valid court order), to protect the rights, property or safety of our users or the public, or as part of a merger or sale of the business, in which case the buyer must honour this policy. We never sell personal data.

## 6. International transfers

${company.legalName} is based in the United States, and our providers may process data in other countries. Where we transfer data from the EEA, the UK or Switzerland, we rely on an adequacy decision (including the EU-U.S. Data Privacy Framework where a provider is certified) or on Standard Contractual Clauses.

## 7. How long we keep it

- **Account data**: while your account exists, then deleted within 30 days of you deleting it or asking us to.
- **Waitlist entries**: until RenderWeld goes on sale and we have told you, or until you ask us to remove you.
- **Orders and invoices**: as long as tax and accounting law requires.
- **Licence keys and activation records**: for the life of the licence, then as long as needed to settle a dispute about it.
- **Messages to us**: as long as needed to answer and follow up.
- **Logs and security records**: only as long as needed to run and secure the site.

## 8. Your rights

Depending on where you live, you can ask to see a copy of your data, correct it, delete it, receive it in a portable format, object to or restrict how we use it, and withdraw consent at any time (withdrawing does not affect what happened before). Email [${contact.privacy}](mailto:${contact.privacy}) from the address on your account. We answer within one month, and may ask you to confirm who you are first.

If you are in the EEA, the UK or Switzerland, you can also complain to your data protection authority.

**California residents**: you have the right to know what personal information we collect and why, to delete it, to correct it, and not to be treated differently for using these rights. We do not sell or share personal information as the CCPA defines those words.

## 9. Security

Traffic is encrypted in transit (HTTPS), sessions use httpOnly cookies, access to personal data is limited to the people who need it, and card data is handled only by Stripe. No system is perfectly secure; if we learn of a breach that affects your data, we will tell you and the authorities where the law requires. To report a vulnerability, see [security.txt](/security.txt).

## 10. Children

The site and RenderWeld are not meant for children under 16, and we do not knowingly collect their data. If you believe a child has given us personal data, email [${contact.privacy}](mailto:${contact.privacy}) and we will delete it.

## 11. Changes to this policy

When we change this policy we update the date at the top. If a change is significant, we tell account holders by email or on the site before it takes effect.

## 12. Contact

${company.legalName}, ${companyAddressLine}. Email [${contact.privacy}](mailto:${contact.privacy}) for privacy questions, or see the [contact page](/contact) for everything else.
`,
};

export default page;
