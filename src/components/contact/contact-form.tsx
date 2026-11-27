'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PublicForm } from '@/lib/platform/forms';
import { buildFormPayload, inputType, submitErrors } from './form-payload';

const FIELD =
  'border-input focus-visible:border-ring w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs md:text-sm';

/**
 * The contact form, rendered from a BuildBase form's published fields and
 * submitted to its public endpoint: the message lands in the console, where
 * a workflow can email or post it. Spam protection is BuildBase's: its
 * built-in check when the form asks for one, its content rules, and the
 * hidden `_hp` trap below.
 */
export function ContactForm({
  form,
  idPrefix = 'contact',
  submitLabel = 'Send message',
  sentMessage = 'Thanks, your message is on its way. We reply by email.',
}: {
  form: PublicForm;
  /** Keeps field ids unique when a page shows more than one form. */
  idPrefix?: string;
  submitLabel?: string;
  sentMessage?: string;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [errors, setErrors] = useState<string[]>([]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);
    setState('sending');
    try {
      const body = buildFormPayload(
        form.fields,
        new FormData(event.currentTarget)
      );
      if (form.captcha === 'pow') body._captcha = await solveChallenge(form);
      const res = await fetch(`${form.endpoint}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setState('sent');
        return;
      }
      setErrors(submitErrors(await res.json().catch(() => null)));
    } catch {
      setErrors(['The message could not be sent. Try again, or email us.']);
    }
    setState('idle');
  }

  if (state === 'sent') {
    return (
      <p role="status" className="text-foreground">
        {sentMessage}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4">
      {form.fields.map((field) => {
        const id = `${idPrefix}-${field.slug}`;
        const help = field.helpText ? `${id}-help` : undefined;
        if (field.type === 'bool') {
          return (
            <div key={field.slug} className="flex items-start gap-2">
              <input
                id={id}
                name={field.slug}
                type="checkbox"
                required={field.required}
                aria-describedby={help}
                className="mt-1"
              />
              <label htmlFor={id} className="text-sm">
                {field.title}
                {help && (
                  <span id={help} className="text-muted-foreground block">
                    {field.helpText}
                  </span>
                )}
              </label>
            </div>
          );
        }
        return (
          <div key={field.slug} className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium">
              {field.title}
              {!field.required && (
                <span className="text-muted-foreground font-normal">
                  {' '}
                  (optional)
                </span>
              )}
            </label>
            {field.type === 'rich-text' ? (
              <textarea
                id={id}
                name={field.slug}
                required={field.required}
                rows={6}
                maxLength={field.max}
                aria-describedby={help}
                className={FIELD}
              />
            ) : (
              <Input
                id={id}
                name={field.slug}
                type={inputType(field.type)}
                required={field.required}
                maxLength={field.type === 'text' ? field.max : undefined}
                aria-describedby={help}
                autoComplete={field.type === 'email' ? 'email' : undefined}
              />
            )}
            {help && (
              <p id={help} className="text-muted-foreground text-xs">
                {field.helpText}
              </p>
            )}
          </div>
        );
      })}

      {/* Bot trap: people never see it; anything typed here is dropped. */}
      <div aria-hidden="true" className="absolute -left-[10000px]">
        <label htmlFor={`${idPrefix}-hp`}>Leave this field empty</label>
        <input
          id={`${idPrefix}-hp`}
          name="_hp"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="text-destructive space-y-1 text-sm">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <Button type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : submitLabel}
      </Button>
    </form>
  );
}

/** BuildBase's built-in check: find the number whose hash is the challenge. */
async function solveChallenge(form: PublicForm): Promise<string> {
  const res = await fetch(`${form.endpoint}/challenge`);
  const c = (await res.json()) as {
    algorithm: string;
    challenge: string;
    maxnumber: number;
    salt: string;
    signature: string;
  };
  const encoder = new TextEncoder();
  for (let n = 0; n <= c.maxnumber; n++) {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(`${c.salt}${n}`)
    );
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    if (hex === c.challenge) {
      return btoa(
        JSON.stringify({
          algorithm: c.algorithm,
          challenge: c.challenge,
          number: n,
          salt: c.salt,
          signature: c.signature,
        })
      );
    }
  }
  throw new Error('No solution');
}
