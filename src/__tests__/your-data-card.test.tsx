import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/i18n/messages/en';

const auth = vi.hoisted(() => ({ openWorkspaceSettings: vi.fn() }));
vi.mock('@buildbase/sdk/react', () => ({ useSaaSAuth: () => auth }));

import {
  downloadMyData,
  EXPORT_FILE_NAME,
  YourDataCard,
} from '@/components/settings/your-data-card';

function renderCard() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <YourDataCard />
    </NextIntlClientProvider>
  );
}

afterEach(() => {
  auth.openWorkspaceSettings.mockClear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Your data card (studio issue #603)', () => {
  it('asks first, says what is kept, then opens BuildBase delete account', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    expect(auth.openWorkspaceSettings).not.toHaveBeenCalled();
    expect(screen.getByText(/tax law/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue to delete' }));
    expect(auth.openWorkspaceSettings).toHaveBeenCalledWith('security');
  });

  it('lets the person back out', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep my account' }));
    expect(auth.openWorkspaceSettings).not.toHaveBeenCalled();
    expect(screen.queryByText(/tax law/)).toBeNull();
  });

  it('shows an error when the download fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('no', { status: 500 }))
    );
    renderCard();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Download my data' }));
    });
    expect((await screen.findByRole('alert')).textContent).toMatch(
      /couldn't be downloaded/
    );
  });
});

describe('downloadMyData', () => {
  it('saves the export as a JSON file', async () => {
    const created: HTMLAnchorElement[] = [];
    const make = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = make(tag);
      if (tag === 'a') {
        vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(() => {});
        created.push(el as HTMLAnchorElement);
      }
      return el;
    });
    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();
    const fetchImpl = vi.fn(async () =>
      Response.json({ success: true, data: { user: { id: 'u1' } } })
    );
    await downloadMyData(fetchImpl as unknown as typeof fetch);
    expect(fetchImpl).toHaveBeenCalledWith('/api/user/export', {
      credentials: 'same-origin',
    });
    expect(created[0].download).toBe(EXPORT_FILE_NAME);
    expect(created[0].click).toHaveBeenCalled();
  });
});
