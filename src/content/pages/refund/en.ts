import type { LegalPageContent } from '../page-loader';

/** The refund page, English. The body is Markdown, rendered on the server. */
const page: LegalPageContent = {
  locale: 'en',
  heroEyebrow: 'Legal',
  heroTitle: 'Refund policy',
  heroDescription:
    'When you can get your money back for a ReelForge Commercial licence. Draft, pending review.',
  seoTitle: 'Refund policy',
  seoDescription:
    'The refund policy for ReelForge, the self-hosted short-form video studio. Draft pending review.',
  lastUpdated: '2026-11-21',
  pendingReview: true,
  body: `This policy applies to paid purchases from this store, such as a ReelForge Commercial licence, sold by **[Legal entity to be confirmed]**. Placeholders in square brackets are not decided yet.

## Free Personal licence keys

The Personal licence key is free: nothing is paid, so there is nothing to refund. You can stop using it at any time. If you need ReelForge for commercial use, buy a Commercial licence on the [pricing page](/pricing).

## When you can get a refund

You can ask for a full refund within **[refund window to be confirmed]** of your purchase when both of these are true:

1. ReelForge does not run on a supported system, as listed in the install documentation at the time you bought it; and
2. our support cannot make it run within a reasonable time after you report the problem with the details we ask for (your system, the steps you followed and the error you see).

## Optional services

Installation and support services bought on top: [refund terms to be confirmed].

## How to ask

Use the [contact page](/contact) and include your order number (it is on your order page and in your receipt) and a description of the problem.

## What happens after a refund

The money goes back to the payment method you used. Your Commercial licence ends: its licence keys stop working, and you must stop using ReelForge commercially (see the [licences](/licence)). Noncommercial use stays possible under the free Personal licence.

## Your legal rights

This policy does not limit any rights you have by law, for example as a consumer in your country.
`,
};

export default page;
