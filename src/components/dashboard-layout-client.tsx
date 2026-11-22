'use client';

import '@/lib/zod-jitless';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRouter as useLocaleRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { isRtlLocale, type Locale } from '@/i18n/config';
import {
  useSaaSAuth,
  WhenAuthenticated,
  WhenUnauthenticated,
  NotificationBell,
  WhenPendingInvitations,
  PendingInvitations,
} from '@buildbase/sdk/react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { WebMcpTools } from '@/components/agents/web-mcp-tools';
import { notificationLinkTarget } from '@/lib/security/safe-link';

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, status } = useSaaSAuth();
  const router = useRouter();
  const localeRouter = useLocaleRouter();
  // The sidebar is pinned by side, not by writing direction; in RTL it
  // belongs on the right or the inset lays out over a gap that is not there.
  const sidebarSide = isRtlLocale(useLocale() as Locale) ? 'right' : 'left';
  const t = useTranslations('common');

  useEffect(() => {
    if (status !== 'loading' && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <>
      <WhenUnauthenticated>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground">{t('redirecting')}</div>
        </div>
      </WhenUnauthenticated>
      <WhenAuthenticated>
        <SidebarProvider>
          <AppSidebar side={sidebarSide} />
          <SidebarInset className="overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex-1" />
              {/* One item per notification, however it was delivered; opening
                  the panel marks items seen, clicking one marks it read. */}
              <NotificationBell
                live
                inboxProps={{
                  onSelect: (item) => {
                    // A path on this site or an allow-listed https URL only.
                    const target = notificationLinkTarget(
                      item.link,
                      window.location.origin
                    );
                    if (target?.kind === 'internal') {
                      localeRouter.push(target.path);
                    } else if (target) window.location.assign(target.url);
                  },
                }}
              />
              <ThemeToggle
                labels={{
                  toggle: t('theme.toggle'),
                  light: t('theme.light'),
                  dark: t('theme.dark'),
                  system: t('theme.system'),
                }}
              />
            </header>
            <div
              id="main-content"
              className="min-h-0 flex-1 overflow-y-auto p-6"
            >
              {/* An invited person sees what is waiting on every page, not
                  only on the empty workspace state. */}
              <WhenPendingInvitations>
                <PendingInvitations className="mb-6" />
              </WhenPendingInvitations>
              <WebMcpTools />
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </WhenAuthenticated>
    </>
  );
}
