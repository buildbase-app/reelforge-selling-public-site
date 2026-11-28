import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import en from '@/i18n/messages/en';

/**
 * The waitlist says what it is and what happens next, in the site's words:
 * no "Register to Beta Users" heading or "Submit" button from the console's
 * beta defaults (studio issue #630).
 */

const submitBetaUser = vi.fn();
vi.mock('@buildbase/sdk', () => ({
  ApiVersion: { V1: 'v1' },
  BetaForm: class {
    submitBetaUser = submitBetaUser;
  },
}));
vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_BUILDBASE_SERVER_URL: 'https://api.example.test',
    NEXT_PUBLIC_BUILDBASE_ORG_ID: '000000000000000000000000',
  },
  buildbaseEnvironment: undefined,
}));
vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { WaitlistForm } from '@/components/modules/waitlist-form';

const w = en.waitlist;
const copy = {
  heading: w.heading,
  nameLabel: w.nameLabel,
  emailLabel: w.emailLabel,
  submit: w.submit,
  submitting: w.submitting,
  success: w.success,
  failed: w.failed,
  note: w.note,
  privacyLink: w.privacyLink,
};

beforeEach(() => submitBetaUser.mockReset());

function fill() {
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Ada' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'ada@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Join the waitlist' }));
}

describe('WaitlistForm', () => {
  it('shows the launch heading, the button and the privacy note', () => {
    render(<WaitlistForm copy={copy} />);
    expect(
      screen.getByRole('heading', {
        name: 'Get an email when RenderWeld launches',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Join the waitlist' })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Register to Beta Users/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
    const link = screen.getByRole('link', { name: 'privacy policy' });
    expect(link).toHaveAttribute('href', '/privacy');
    expect(link.parentElement).toHaveTextContent(
      'One email on launch day. No spam. Read our privacy policy.'
    );
  });

  it('sends the name and email and says the visitor is on the list', async () => {
    submitBetaUser.mockResolvedValue({ status: 'success', message: 'ok' });
    render(<WaitlistForm copy={copy} />);
    fill();
    expect(await screen.findByRole('status')).toHaveTextContent(w.success);
    expect(submitBetaUser).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.test',
    });
  });

  it('announces a failure and keeps the form', async () => {
    submitBetaUser.mockRejectedValue(new Error('offline'));
    render(<WaitlistForm copy={copy} />);
    fill();
    expect(await screen.findByRole('alert')).toHaveTextContent(w.failed);
    expect(
      screen.getByRole('button', { name: 'Join the waitlist' })
    ).toBeEnabled();
  });
});
