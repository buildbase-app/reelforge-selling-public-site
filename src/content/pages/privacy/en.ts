import type { LegalPageContent } from '../page-loader';

/** The privacy page, English. The body is Markdown, rendered on the server. */
const page: LegalPageContent = {
  locale: 'en',
  heroEyebrow: 'Legal',
  heroTitle: 'Privacy Policy',
  heroDescription:
    'What personal data this store collects, why, who processes it, and your rights. Draft, pending review.',
  lastUpdated: '2026-11-21',
  pendingReview: true,
  body: `This policy covers the ReelForge store at this website. ReelForge itself runs on your own computer or server and does not send us your videos or projects. Placeholders in square brackets are not decided yet.

## Who is responsible

The controller of your personal data is **[Legal entity to be confirmed]** ([address to be confirmed]). You can reach us through the [contact page](/contact).

## What we collect and why

- **Account data**: your name, email address and sign-in details when you create an account, to give you access to your account, orders and downloads.
- **Waitlist entries**: the name and email you leave on the waitlist, to tell you when ReelForge can be bought.
- **Order data**: what you bought, when, the amount, your billing country and the status of your payment, to deliver your purchase, keep accounting records and handle refunds. Card details go to Stripe; we do not see your full card number.
- **Licence and download records**: licence keys issued to you, where they are activated and how often files were downloaded, to deliver and protect your purchase.
- **Notification settings**: which emails and push messages you want, and your browser's push subscription if you turn push on.
- **Messages you send us**: to answer them.
- **Technical data**: IP address, browser and request logs created when you use the site, to run and secure it.

Legal bases (where EU/UK law applies): performing our contract with you, our legitimate interest in running and securing the store, legal obligations (such as keeping invoices), and your consent where we ask for it. [To be reviewed.]

## Who processes it for us

- **BuildBase**: sign-in, accounts, workspaces, the waitlist, orders, licence keys, file delivery and notifications.
- **Stripe**: payments, tax calculation, fraud prevention and refunds.
- **Cloudflare**: hosting (Workers), the site's database (D1), content delivery, security, and Cloudflare Web Analytics.

These providers may process data outside your country. [Transfer safeguards to be confirmed.]

## Analytics and verification scripts

- **Ship or Die verification script**: public pages load a script from ship-or-die.com (order and account pages do not), before any cookie choice, so the Ship or Die hackathon can verify this site's traffic. It sends page-view information to Ship or Die; see Ship or Die's own privacy information for what it collects. [To be reviewed.]
- **Cloudflare Web Analytics**: Cloudflare adds its analytics script to pages on this domain. It counts page views and performance without cookies.
- Other analytics or marketing tags load only if you accept them in the cookie banner. [None are configured at the time of writing; to be confirmed.]

## Cookies

- \`bb_consent\`: remembers your choice in the cookie banner.
- \`NEXT_LOCALE\`: remembers your language choice.
- \`bb-session-id\`: keeps you signed in (httpOnly; set when you sign in, removed when you sign out).
- \`sidebar_state\`: remembers whether the account sidebar is open.

The sign-in pages run by BuildBase may set their own cookies on their own domain.

## How long we keep it

[Retention periods to be confirmed.] Order records are kept as long as accounting law requires.

## Your rights

Depending on where you live, you can ask for a copy of your data, correct it, delete it, object to or restrict its use, and take it elsewhere. To use these rights, contact us through the [contact page](/contact). You can also complain to your data protection authority.

## Contact

Questions about this policy or your data: see the [contact page](/contact).
`,
};

export default page;
