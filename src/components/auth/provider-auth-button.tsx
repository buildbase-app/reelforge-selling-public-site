'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  useSaaSAuth,
  WhenAuthenticated,
  WhenUnauthenticated,
} from '@buildbase/sdk/react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

/** The header's auth button on pages inside `SaaSProvider` (the `(store)` group). */
export function ProviderAuthButton() {
  const { signIn, isLoading, status } = useSaaSAuth();
  const t = useTranslations('common');

  if (status === 'loading' || status === 'authenticating' || isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t('buttons.loading')}
      </Button>
    );
  }

  return (
    <>
      <WhenUnauthenticated>
        <Button onClick={() => signIn()}>{t('buttons.signIn')}</Button>
      </WhenUnauthenticated>
      <WhenAuthenticated>
        <Button asChild>
          <Link href="/dashboard">{t('nav.dashboard')}</Link>
        </Button>
      </WhenAuthenticated>
    </>
  );
}
