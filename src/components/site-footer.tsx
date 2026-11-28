import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { siteConfig } from '@/config/site';
import { BrandLogo } from '@/components/brand-logo';
import { CookieSettingsButton } from '@/components/tracking/cookie-settings-button';

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
        { label: t('footer.links.gallery'), href: '/gallery' },
        { label: t('footer.links.agents'), href: '/agents' },
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
        { label: t('footer.links.docs'), href: '/docs' },
        { label: t('footer.links.help'), href: '/help' },
        { label: t('footer.links.blog'), href: '/blog' },
        { label: t('footer.links.about'), href: '/about' },
        { label: t('footer.links.security'), href: '/security' },
        { label: t('footer.links.feedback'), href: '/feedback' },
        { label: t('footer.links.contact'), href: '/contact' },
      ],
    },
    {
      section: t('footer.sections.legal'),
      links: [
        { label: t('footer.links.licence'), href: '/licence' },
        { label: t('footer.links.refund'), href: '/refund' },
        { label: t('footer.links.privacy'), href: '/privacy' },
        { label: t('footer.links.terms'), href: '/terms' },
        { label: t('footer.links.cookies'), href: '/cookies' },
      ],
    },
  ];

  return (
    <footer className="bg-background w-full border-t">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-1 flex flex-col gap-4">
            <Link
              href="/"
              className="text-foreground inline-flex min-h-11 items-center self-start text-lg"
              aria-label={title}
            >
              <BrandLogo />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map(({ section, links }) => (
            <div key={section} className="flex flex-col gap-3">
              <h2 className="text-foreground text-sm font-medium">{section}</h2>
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
                {section === t('footer.sections.legal') && (
                  <li>
                    <CookieSettingsButton
                      label={t('footer.links.cookieSettings')}
                    />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            © {year} {siteConfig.company.legalName}.{' '}
            {t('footer.productOf', {
              product: title,
              company: siteConfig.company.legalName,
            })}
            .
          </p>
          <div className="flex items-center gap-3">
            <LanguageSwitcher label={t('language.select')} />
            <ThemeToggle
              labels={{
                toggle: t('theme.toggle'),
                light: t('theme.light'),
                dark: t('theme.dark'),
                system: t('theme.system'),
              }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
