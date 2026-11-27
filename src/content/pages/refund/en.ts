import { siteConfig } from '@/config/site';
import type { LegalPageContent } from '../page-loader';

const { company, contact } = siteConfig;

/** The refund page, English. The body is Markdown, rendered on the server. */
const page: LegalPageContent = {
  locale: 'en',
  heroEyebrow: 'Legal',
  heroTitle: 'Refund policy',
  heroDescription:
    'When you can get your money back for a RenderWeld Commercial licence. Draft, pending review.',
  seoTitle: 'Refund policy',
  seoDescription:
    'The refund policy for RenderWeld, the self-hosted video renderer. Draft pending review.',
  lastUpdated: '2026-11-27',
  pendingReview: true,
  body: `This policy applies to paid purchases from this store, such as a RenderWeld Commercial licence, sold by **${company.legalName}**. It sits alongside the [terms of service](/terms).

## Free Personal licence keys

The Personal licence key is free: nothing is paid, so there is nothing to refund. You can stop using it at any time. If you need RenderWeld for commercial use, buy a Commercial licence on the [pricing page](/pricing).

## When you can get a refund

You can ask for a full refund within **14 days** of your purchase when both of these are true:

1. RenderWeld does not run on a supported system, as listed in the install documentation at the time you bought it; and
2. our support cannot make it run within a reasonable time after you report the problem with the details we ask for (your system, the steps you followed and the error you see).

A charge you did not make, or a duplicate charge for the same order, is always refunded in full.

## Optional services

Installation and support services bought on top are refunded in full if we have not started the work, and for the part not yet delivered once we have.

## How to ask

Email [${contact.support}](mailto:${contact.support}) with your order number (it is on your order page and in your receipt) and a description of the problem. We reply within a few working days and, once a refund is approved, issue it straight away.

## What happens after a refund

The money goes back to the payment method you used; how long it takes to appear depends on your bank. Your Commercial licence ends: its licence keys stop working, and you must stop using RenderWeld commercially (see the [licences](/licence)). Noncommercial use stays possible under the free Personal licence.

## Chargebacks

Please email us before you dispute a charge with your bank: we can usually fix it faster. A disputed charge suspends the licence keys of that order until the dispute is settled.

## Your legal rights

This policy does not limit any rights you have by law, for example as a consumer in your country.
`,
};

export default page;
