import 'server-only';
import { isAccessRefused } from '@buildbase/sdk';
import { withSession } from '@/lib/buildbase';

/**
 * Whether BuildBase says this session is over (studio issue #602): its
 * profile check is refused with 401, 403 or 404. A refusal for the
 * person's network or a workspace's rules keeps the session, and so does
 * no answer (offline, a timeout, a 5xx or a 429): only a clear "this
 * session is gone" clears the cookie.
 */
export async function isSessionDead(sessionId: string): Promise<boolean> {
  try {
    await withSession(sessionId).users.getProfile();
    return false;
  } catch (error) {
    if (isAccessRefused(error)) return false;
    const status = (error as { status?: unknown } | null)?.status;
    return status === 401 || status === 403 || status === 404;
  }
}
