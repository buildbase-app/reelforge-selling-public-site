import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { BuildBaseBadge } from '@buildbase/sdk/react';
import { siteConfig } from '@/config/site';

interface SiteFooterProps {
  title: string;
}

export async function SiteFooter({ title }: SiteFooterProps) {
  const t = await getTranslations('common');
  const year = new Date().getFullYear();

  const footerLinks = [
    {
      section: t('footer.sections.product'),
      links: [
        { label: t('footer.links.pricing'), href: '/pricing' },
        { label: t('footer.links.waitlist'), href: '/waitlist' },
        { label: t('footer.links.changelog'), href: '/changelog' },
        { label: t('footer.links.dashboard'), href: '/dashboard' },
      ],
    },
    {
      section: t('footer.sections.resources'),
      links: [
        // The product's public, source-available repository.
        { label: t('footer.links.github'), href: siteConfig.repo.url },
        { label: t('footer.links.help'), href: '/help' },
        { label: t('footer.links.contact'), href: '/contact' },
        { label: t('footer.links.blog'), href: '/blog' },
      ],
    },
    {
      section: t('footer.sections.legal'),
      links: [
        { label: t('footer.links.licence'), href: '/licence' },
        { label: t('footer.links.refund'), href: '/refund' },
        { label: t('footer.links.privacy'), href: '/privacy' },
        { label: t('footer.links.terms'), href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="border-border/50 bg-background w-full border-t">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-1 flex flex-col gap-4">
            <Link
              href="/"
              className="text-foreground text-xl font-bold tracking-tight"
            >
              {title}
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map(({ section, links }) => (
            <div key={section} className="flex flex-col gap-3">
              <h3 className="text-foreground text-sm font-semibold">
                {section}
              </h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    {/^https?:\/\//.test(link.href) ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-border/50 mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            © {year} {title}. {t('footer.rights')}.
          </p>
          <div className="flex items-center gap-3">
            {/* The platform's badge: an image and a link, no script, no network call. */}
            <BuildBaseBadge variant="built-with" theme="auto" size="sm" />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
