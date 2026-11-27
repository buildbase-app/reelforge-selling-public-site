'use client';

/** The event `LiteCookieBanner` listens for to reopen the cookie choices. */
export const COOKIE_SETTINGS_EVENT = 'renderweld:cookie-settings';

/**
 * The footer's "Cookie settings" link: reopens the cookie banner on the
 * visitor's current answer, so a choice can be changed as easily as it was
 * given. A button, not a link, because it opens a dialog and goes nowhere.
 * It sends an event instead of importing the SDK's `openCookieBanner`, which
 * would load the SDK's UI bundle on every public page (studio issue #79).
 */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
      className="text-muted-foreground hover:text-foreground text-left text-sm transition-colors"
    >
      {label}
    </button>
  );
}
