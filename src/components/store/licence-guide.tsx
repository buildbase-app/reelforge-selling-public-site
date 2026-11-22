import { ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Link } from '@/i18n/link';
import { cn } from '@/lib/utils';

/**
 * "Which licence do I need?": the table from LICENSING.md in the product
 * repository, in plain words, with links to the source and the licensing
 * documents. ReelForge is source-available (PolyForm Noncommercial 1.0.0
 * for noncommercial use, a paid Commercial licence for anything else).
 * English only for now (src/i18n/config.ts); kept together for translation.
 */
const ROWS: { want: string; need: string }[] = [
  {
    want: 'Read the code, learn from it, or run it for yourself as a hobby, for study, research or evaluation',
    need: 'Nothing to pay. A free Personal licence key (PolyForm Noncommercial 1.0.0), claimed with a BuildBase account.',
  },
  {
    want: 'Make videos for anything that earns money: a monetised channel, client work, ads, a business, an agency, a product',
    need: 'A paid Commercial licence: one-time, per server, in the tier that fits.',
  },
  {
    want: 'Use it at a charity, school, public research body or government, noncommercially',
    need: 'Free under PolyForm Noncommercial (its "Noncommercial Organizations" section).',
  },
  {
    want: 'Resell, rebrand, redistribute, or offer ReelForge (or a modified copy) as a product or hosted service to others',
    need: 'Not permitted under either licence. Ask us about a partner agreement.',
  },
  {
    want: 'Use the name "ReelForge" or its logo for your own fork or product',
    need: 'Not permitted. Forks must be renamed (trademark policy).',
  },
];

export function LicenceGuide({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="licence-guide-title"
      className={cn('bg-card rounded-2xl border p-6 md:p-8', className)}
    >
      <h2
        id="licence-guide-title"
        className="text-2xl font-medium tracking-tight"
      >
        Which licence do I need?
      </h2>
      <p className="text-muted-foreground mt-2 text-sm">
        ReelForge is source-available: you can read every line of it on GitHub.
        What you may do with it depends on how you use it. Every released Docker
        image activates with a licence key from BuildBase.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2 pr-4 font-medium">
                You want to…
              </th>
              <th scope="col" className="py-2 font-medium">
                You need
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ROWS.map((row) => (
              <tr key={row.want} className="align-top">
                <td className="py-3 pr-4">{row.want}</td>
                <td className="text-muted-foreground py-3">{row.need}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground mt-4 text-xs">
        Commercial use is any use by or for a business, or any use meant to earn
        money, directly or indirectly. When in doubt, it is commercial, or{' '}
        <Link href="/contact" className="underline underline-offset-2">
          ask us
        </Link>
        .
      </p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
        <a
          href={siteConfig.repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary inline-flex items-center gap-1 underline-offset-2 hover:underline"
        >
          Read the source on GitHub
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        <a
          href={siteConfig.repo.licensing}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary inline-flex items-center gap-1 underline-offset-2 hover:underline"
        >
          LICENSING.md
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        <Link
          href="/licence"
          className="text-primary underline-offset-2 hover:underline"
        >
          Licence summary
        </Link>
      </div>
    </section>
  );
}
