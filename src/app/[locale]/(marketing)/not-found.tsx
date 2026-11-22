import { getTranslations } from 'next-intl/server';
import { ArrowLeft, FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/back-button';
import { Link } from '@/i18n/link';

/**
 * 404, inside the public site's header and footer: it renders in the
 * `(marketing)` layout, which gives it the shell. It used to sit in the
 * locale layout and mount its own `MarketingShell`, which put a second copy
 * of the header's client code into every page's first load (studio issue
 * #79). Unmatched paths reach it through `./[...rest]`; only these pages
 * call `notFound()`. A page outside this group that calls it would get
 * Next's plain 404, so add a `not-found.tsx` there first.
 */
export default async function NotFound() {
  const t = await getTranslations('errors');

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-6 flex justify-center">
        <div className="bg-muted rounded-full p-4">
          <FileQuestion className="text-muted-foreground h-12 w-12" />
        </div>
      </div>

      <p className="text-foreground mb-2 text-6xl font-medium tabular-nums">
        404
      </p>

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
        <BackButton>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('notFound.goBack')}
        </BackButton>
      </div>
    </div>
  );
}
