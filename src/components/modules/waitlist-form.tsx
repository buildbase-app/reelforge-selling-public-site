'use client';

import '@/lib/zod-jitless';
import { useState } from 'react';
import { ApiVersion, BetaForm } from '@buildbase/sdk';
import { buildbaseEnvironment, env } from '@/env';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';

export interface WaitlistCopy {
  heading: string;
  nameLabel: string;
  emailLabel: string;
  submit: string;
  submitting: string;
  /** The note under the button: `note` then a link reading `privacyLink`. */
  note: string;
  privacyLink: string;
  success: string;
  failed: string;
}

/**
 * The waitlist: a name and an email, sent to the platform's beta list (the
 * console lists them under Users → Beta). Our own form on the SDK's
 * `BetaForm` API class, so the heading, button and note are the site's
 * words, not the console's beta screen defaults (studio issue #630).
 */
export function WaitlistForm({ copy }: { copy: WaitlistCopy }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    setState('sending');
    try {
      const api = new BetaForm({
        serverUrl: env.NEXT_PUBLIC_BUILDBASE_SERVER_URL,
        version: ApiVersion.V1,
        orgId: env.NEXT_PUBLIC_BUILDBASE_ORG_ID,
        environment: buildbaseEnvironment,
      });
      const res = await api.submitBetaUser({
        name: String(data.get('name') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(),
      });
      if (res.status === 'success') {
        setState('sent');
        return;
      }
      setError(res.message || copy.failed);
    } catch {
      setError(copy.failed);
    }
    setState('idle');
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h2 className="text-lg font-medium">{copy.heading}</h2>
        {state === 'sent' ? (
          <p role="status" className="text-sm">
            {copy.success}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="waitlist-name" className="text-sm font-medium">
                {copy.nameLabel}
              </label>
              <Input
                id="waitlist-name"
                name="name"
                required
                maxLength={50}
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="waitlist-email" className="text-sm font-medium">
                {copy.emailLabel}
              </label>
              <Input
                id="waitlist-email"
                name="email"
                type="email"
                required
                maxLength={100}
                autoComplete="email"
              />
            </div>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={state === 'sending'}
            >
              {state === 'sending' ? copy.submitting : copy.submit}
            </Button>
          </form>
        )}
        <p className="text-muted-foreground text-xs">
          {copy.note}{' '}
          <Link href="/privacy" className="underline underline-offset-4">
            {copy.privacyLink}
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
