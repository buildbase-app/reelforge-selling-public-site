'use client';

import '@/lib/zod-jitless';
import { useTranslations } from 'next-intl';
import { useSaaSWorkspaces, usePushNotifications } from '@buildbase/sdk/react';
import { toast } from 'sonner';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PreferencesCard } from '@/components/notifications/preferences-card';

/**
 * The signed-in person's own notification settings: which events reach them
 * by email or push, and whether this browser receives push messages.
 */
export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const { currentWorkspace } = useSaaSWorkspaces();
  const { isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  const handlePushToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success(t('toast.pushDisabled'));
      } else {
        await subscribe();
        toast.success(t('toast.pushEnabled'));
      }
    } catch {
      toast.error(t('toast.pushFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <PreferencesCard workspaceId={currentWorkspace?._id} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {t('pushCard.title')}
          </CardTitle>
          <CardDescription>{t('pushCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Badge variant={isSubscribed ? 'default' : 'secondary'}>
            {isSubscribed
              ? t('pushCard.subscribed')
              : t('pushCard.notSubscribed')}
          </Badge>
          <Button variant="outline" size="sm" onClick={handlePushToggle}>
            {isSubscribed ? t('pushCard.unsubscribe') : t('pushCard.subscribe')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
