import 'server-only';
import { logger } from '@/lib/logger';

/**
 * BuildBase Forms (console: Forms) read on the server: a form's published
 * fields and whether it asks for a captcha. The browser then submits to the
 * form's public endpoint (`ContactForm`), so the console stays the source of
 * truth for what the fields are, and submissions land in the console.
 * Docs: https://docs.buildbase.app/forms/custom-forms
 */

export type FormFieldType =
  | 'text'
  | 'rich-text'
  | 'number'
  | 'bool'
  | 'date'
  | 'color'
  | 'link'
  | 'email'
  | 'file';

export interface FormField {
  slug: string;
  title: string;
  helpText?: string;
  type: FormFieldType;
  required: boolean;
  /** Longest value the form takes, for text and rich-text fields. */
  max?: number;
}

/** What `ContactForm` needs to render and submit one form. */
export interface PublicForm {
  /** `<server>/api/forms/public/<orgId>/<formId>`. */
  endpoint: string;
  fields: FormField[];
  /** `pow` is BuildBase's built-in check, solved in the browser. */
  captcha: 'none' | 'pow';
}

/** The contact form's id, from NEXT_PUBLIC_BUILDBASE_CONTACT_FORM_ID. */
export const CONTACT_FORM_ID =
  process.env.NEXT_PUBLIC_BUILDBASE_CONTACT_FORM_ID?.trim() || null;

/** The forms on /feedback, from their NEXT_PUBLIC_BUILDBASE_* ids. */
export const FEATURE_REQUEST_FORM_ID =
  process.env.NEXT_PUBLIC_BUILDBASE_FEATURE_REQUEST_FORM_ID?.trim() || null;
export const TEMPLATE_REQUEST_FORM_ID =
  process.env.NEXT_PUBLIC_BUILDBASE_TEMPLATE_REQUEST_FORM_ID?.trim() || null;

const FORM_REVALIDATE_SECONDS = 300;

/**
 * One published form, or null when it is not configured, cannot be read, or
 * needs what this site cannot render: a provider captcha (Turnstile,
 * hCaptcha, reCAPTCHA, which need their own keys and script hosts) or a
 * required file field. The page then shows only its email addresses.
 */
export async function getPublicForm(
  formId: string | null = CONTACT_FORM_ID
): Promise<PublicForm | null> {
  const orgId = process.env.NEXT_PUBLIC_BUILDBASE_ORG_ID?.trim();
  if (!formId || !orgId) return null;
  const server = (
    process.env.NEXT_PUBLIC_BUILDBASE_SERVER_URL ||
    'https://api.console.buildbase.app'
  ).replace(/\/+$/, '');
  const endpoint = `${server}/api/forms/public/${encodeURIComponent(orgId)}/${encodeURIComponent(formId)}`;

  try {
    const init = { next: { revalidate: FORM_REVALIDATE_SECONDS } };
    const [formRes, fieldsRes] = await Promise.all([
      fetch(endpoint, init),
      fetch(`${endpoint}/fields`, init),
    ]);
    if (!formRes.ok || !fieldsRes.ok) {
      logger.warn('Form not readable', {
        formId,
        status: formRes.ok ? fieldsRes.status : formRes.status,
      });
      return null;
    }
    const form = (await formRes.json()) as {
      captcha?: { widget?: string } | null;
    };
    const fields = (await fieldsRes.json()) as FormField[];
    return toPublicForm(endpoint, form.captcha?.widget, fields);
  } catch (error) {
    logger.warn('Form fetch failed', {
      formId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/** Pure part of `getPublicForm`, exported for tests. */
export function toPublicForm(
  endpoint: string,
  widget: string | undefined,
  fields: FormField[]
): PublicForm | null {
  if (widget && widget !== 'pow') return null;
  if (!Array.isArray(fields) || fields.length === 0) return null;
  if (fields.some((f) => f.type === 'file' && f.required)) return null;
  return {
    endpoint,
    // Optional file fields are left out: uploads are not supported here.
    fields: fields.filter((f) => f.type !== 'file'),
    captcha: widget === 'pow' ? 'pow' : 'none',
  };
}
