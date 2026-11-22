import { Link } from '@/i18n/link';
import { SUPPORT_EMAIL_TODO, siteConfig } from '@/config/site';

/**
 * How to reach support: the configured email (NEXT_PUBLIC_SUPPORT_EMAIL),
 * or, when none is set, the help and contact pages. Development builds
 * show a TODO instead so the missing address is noticed; production never
 * shows it.
 */
export function SupportContact({ className }: { className?: string }) {
  const email = siteConfig.contact.support;
  if (email) {
    return (
      <span className={className}>
        Email{' '}
        <a
          href={`mailto:${email}`}
          className="text-foreground font-medium underline underline-offset-2"
        >
          {email}
        </a>
        .
      </span>
    );
  }
  return (
    <span className={className}>
      {process.env.NODE_ENV !== 'production' && (
        <span className="text-destructive mr-1 font-mono text-xs">
          [{SUPPORT_EMAIL_TODO}]
        </span>
      )}
      Contact us via the{' '}
      <Link
        href="/contact"
        className="text-foreground font-medium underline underline-offset-2"
      >
        contact page
      </Link>{' '}
      or see{' '}
      <Link
        href="/help"
        className="text-foreground font-medium underline underline-offset-2"
      >
        Help
      </Link>
      .
    </span>
  );
}
