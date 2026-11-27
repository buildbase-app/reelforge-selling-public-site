import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('server-only', () => ({}));

import { ContactForm } from '@/components/contact/contact-form';
import {
  buildFormPayload,
  submitErrors,
} from '@/components/contact/form-payload';
import { toPublicForm, type FormField } from '@/lib/platform/forms';

const FIELDS: FormField[] = [
  { slug: 'name', title: 'Name', type: 'text', required: true },
  { slug: 'email', title: 'Email', type: 'email', required: true },
  { slug: 'order', title: 'Order number', type: 'number', required: false },
  { slug: 'news', title: 'Send me news', type: 'bool', required: false },
  { slug: 'message', title: 'Message', type: 'rich-text', required: true },
];
const ENDPOINT = 'https://api.example.test/api/forms/public/org/form';

function formData(entries: Record<string, string>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(entries)) data.set(k, v);
  return data;
}

describe('toPublicForm', () => {
  it('keeps a form with no captcha or the built-in check', () => {
    expect(toPublicForm(ENDPOINT, undefined, FIELDS)?.captcha).toBe('none');
    expect(toPublicForm(ENDPOINT, 'pow', FIELDS)?.captcha).toBe('pow');
  });

  it('drops a form this site cannot render', () => {
    expect(toPublicForm(ENDPOINT, 'turnstile', FIELDS)).toBeNull();
    expect(toPublicForm(ENDPOINT, undefined, [])).toBeNull();
    expect(
      toPublicForm(ENDPOINT, undefined, [
        { slug: 'file', title: 'File', type: 'file', required: true },
      ])
    ).toBeNull();
  });

  it('leaves optional file fields out', () => {
    const form = toPublicForm(ENDPOINT, undefined, [
      ...FIELDS,
      { slug: 'shot', title: 'Screenshot', type: 'file', required: false },
    ]);
    expect(form?.fields.map((f) => f.slug)).not.toContain('shot');
  });
});

describe('buildFormPayload', () => {
  it('types each value and leaves empty optional ones out', () => {
    expect(
      buildFormPayload(
        FIELDS,
        formData({
          name: ' Ada ',
          email: 'ada@example.com',
          order: '42',
          news: 'on',
          message: 'Hello',
        })
      )
    ).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      order: 42,
      news: true,
      message: 'Hello',
    });
    expect(
      buildFormPayload(
        FIELDS,
        formData({ name: 'Ada', email: 'a@b.c', message: 'Hi', order: '' })
      )
    ).toEqual({ name: 'Ada', email: 'a@b.c', news: false, message: 'Hi' });
  });

  it('passes the bot trap on when it is filled', () => {
    expect(buildFormPayload(FIELDS, formData({ _hp: 'spam' }))._hp).toBe(
      'spam'
    );
  });
});

describe('submitErrors', () => {
  it('reads the error list, then the message, then a default', () => {
    expect(submitErrors({ errors: ['Email is required'] })).toEqual([
      'Email is required',
    ]);
    expect(submitErrors({ message: 'Too many submissions' })).toEqual([
      'Too many submissions',
    ]);
    expect(submitErrors(null)[0]).toMatch(/could not be sent/);
  });
});

describe('ContactForm', () => {
  it('renders the console fields and submits them to the form endpoint', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));
    const form = toPublicForm(ENDPOINT, undefined, FIELDS)!;
    render(<ContactForm form={form} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Ada' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/on its way/)
    );
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${ENDPOINT}/submit`);
    expect(JSON.parse(String(init?.body))).toMatchObject({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello',
    });
    fetchMock.mockRestore();
  });

  it('shows the errors of a refused submission', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ errors: ['Email is invalid'] }), {
        status: 400,
      })
    );
    render(<ContactForm form={toPublicForm(ENDPOINT, undefined, FIELDS)!} />);
    fireEvent.submit(
      screen.getByRole('button', { name: 'Send message' }).closest('form')!
    );
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Email is invalid')
    );
    fetchMock.mockRestore();
  });

  it('takes its own labels, ids and length limits for another form', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));
    const form = toPublicForm(ENDPOINT, undefined, [
      { slug: 'title', title: 'Idea', type: 'text', required: true, max: 140 },
      {
        slug: 'details',
        title: 'Details',
        type: 'rich-text',
        required: true,
        max: 4000,
      },
    ])!;
    render(
      <ContactForm
        form={form}
        idPrefix="feature"
        submitLabel="Send suggestion"
        sentMessage="Thanks for the idea."
      />
    );
    const idea = screen.getByLabelText('Idea');
    expect(idea).toHaveAttribute('id', 'feature-title');
    expect(idea).toHaveAttribute('maxlength', '140');
    expect(screen.getByLabelText('Details')).toHaveAttribute(
      'maxlength',
      '4000'
    );
    fireEvent.change(idea, { target: { value: 'GIF export' } });
    fireEvent.change(screen.getByLabelText('Details'), {
      target: { value: 'For chat apps' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send suggestion' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Thanks for the idea.'
      )
    );
    fetchMock.mockRestore();
  });
});
