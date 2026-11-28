'use client';

import '@/lib/zod-jitless';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSaaSAuth } from '@buildbase/sdk/react';
import { Download, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const EXPORT_FILE_NAME = 'renderweld-my-data.json';

/** Fetch the signed-in person's export and hand it to the browser as a file. */
export async function downloadMyData(fetchImpl: typeof fetch = fetch) {
  const res = await fetchImpl('/api/user/export', {
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error(`Export failed with ${res.status}`);
  const body = (await res.json()) as { data?: unknown };
  const blob = new Blob([JSON.stringify(body.data ?? body, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = EXPORT_FILE_NAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Settings' self-serve export and delete (studio issue #603).
 *
 * Download my data saves the store's export as a file. Delete my account
 * first says here what goes and what is kept, then opens BuildBase's own
 * Delete account flow (Security), which confirms it's the person, refuses
 * while they own a workspace others use, schedules or runs the deletion and
 * ends their sessions. When it runs, BuildBase sends `user.deleted` and the
 * webhook erases this store's copy.
 */
export function YourDataCard() {
  const t = useTranslations('settings.data');
  const { openWorkspaceSettings } = useSaaSAuth();
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function onDownload() {
    setDownloading(true);
    setFailed(false);
    try {
      await downloadMyData();
    } catch {
      setFailed(true);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onDownload} disabled={downloading}>
            <Download className="mr-2 h-4 w-4" />
            {downloading ? t('downloading') : t('download')}
          </Button>
          {!confirming && (
            <Button variant="destructive" onClick={() => setConfirming(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('delete')}
            </Button>
          )}
        </div>
        {failed && (
          <p role="alert" className="text-destructive text-sm">
            {t('downloadFailed')}
          </p>
        )}
        {confirming && (
          <div
            role="group"
            aria-labelledby="delete-account-title"
            className="border-destructive/50 space-y-3 rounded-md border p-4"
          >
            <p id="delete-account-title" className="text-sm font-medium">
              {t('confirmTitle')}
            </p>
            <p className="text-muted-foreground text-sm">{t('confirmBody')}</p>
            <p className="text-muted-foreground text-sm">{t('kept')}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="destructive"
                onClick={() => {
                  setConfirming(false);
                  openWorkspaceSettings('security');
                }}
              >
                {t('continue')}
              </Button>
              <Button variant="outline" onClick={() => setConfirming(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
