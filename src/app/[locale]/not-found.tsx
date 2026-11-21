import { getTranslations } from 'next-intl/server';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/back-button';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { Link } from '@/i18n/routing';

/** 404, inside the public site's header and footer. */
export default async function NotFound() {
  const t = await getTranslations('errors');

  return (
    <MarketingShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-muted rounded-full p-4">
            <FileQuestion className="text-muted-foreground h-12 w-12" />
          </div>
        </div>

        <p className="text-foreground mb-2 text-6xl font-bold">404</p>

        <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight">
          {t('notFound.title')}
        </h1>

        <p className="text-muted-foreground mb-6 max-w-md">
          {t('notFound.description')}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="default" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              {t('generic.goHome')}
            </Link>
          </Button>
          <BackButton label={t('notFound.goBack')} />
        </div>
      </div>
    </MarketingShell>
  );
}
