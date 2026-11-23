import type { Page } from '@playwright/test';

/**
 * A signed-in dashboard without an account: the session endpoint and the
 * BuildBase API answer with made-up data, so the account pages render
 * instead of redirecting a signed-out visitor home.
 */
export async function fakeSignIn(page: Page) {
  const user = {
    _id: 'u_e2e',
    name: 'Sample Buyer',
    email: 'buyer@example.com',
    emailVerified: true,
  };
  const workspace = {
    _id: 'w_e2e',
    name: 'Sample workspace',
    createdBy: user._id,
    users: [{ user, role: 'owner' }],
    roles: ['owner'],
    features: {},
  };
  await page.route(/\/api\/auth\/session$/, (route) =>
    route.fulfill({ json: { sessionId: 'e2e-session' } })
  );
  await page.route(/\/api\/v1\/public\//, (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const json = /\/profile$/.test(path)
      ? user
      : /\/workspaces$/.test(path)
        ? [workspace]
        : /\/workspaces\/[^/]+$/.test(path)
          ? workspace
          : /\/(notifications|invitations|holdings|orders)$/.test(path)
            ? []
            : {};
    return route.fulfill({
      json,
      headers: {
        'access-control-allow-origin': request.headers()['origin'] ?? '*',
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers':
          request.headers()['access-control-request-headers'] ?? '*',
      },
    });
  });
}
