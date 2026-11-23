import { test, expect, type Locator } from '@playwright/test';

/**
 * The cookie banner gives no answer more weight than the other (studio
 * issue #284; no dark pattern, EDPB guidance on equal prominence): Reject
 * all and Accept all look the same, in the site's button shape. Choose is
 * the outline button beside them.
 */

function look(button: Locator) {
  return button.evaluate((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      background: s.backgroundColor,
      color: s.color,
      border: `${s.borderTopWidth} ${s.borderTopColor}`,
      radius: s.borderRadius,
      height: Math.round(r.height),
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
    };
  });
}

for (const scheme of ['light', 'dark'] as const) {
  test(`Reject all and Accept all look the same (${scheme})`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/pricing');
    const banner = page.getByRole('region', { name: 'Cookie consent' });
    const reject = banner.getByRole('button', { name: 'Reject all' });
    const accept = banner.getByRole('button', { name: 'Accept all' });
    await expect(reject).toBeVisible();
    const a = await look(reject);
    expect(await look(accept)).toEqual(a);
    // The site's button: the accent fill, 36px tall, 8px corners, 14px type.
    expect(a.background).toBe('rgb(255, 79, 0)');
    expect(a.height).toBe(36);
    expect(a.radius).toBe('8px');
    expect(a.fontSize).toBe('14px');
    // Choose is the secondary, outline button in the same shape.
    const choose = await look(banner.getByRole('button', { name: 'Choose' }));
    expect(choose.background).not.toBe(a.background);
    expect(choose.height).toBe(36);
    expect(choose.radius).toBe('8px');
  });
}
