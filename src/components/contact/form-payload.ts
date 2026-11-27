import type { FormField } from '@/lib/platform/forms';

/**
 * The submit body for a BuildBase form: each field typed as the server
 * expects (a number as a number, a checkbox as a boolean), empty optional
 * values left out, and the hidden bot trap as `_hp`.
 * https://docs.buildbase.app/forms/custom-forms#numbers-and-booleans
 */
export function buildFormPayload(
  fields: FormField[],
  form: FormData
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = form.get(field.slug);
    if (field.type === 'bool') {
      data[field.slug] = raw === 'on';
      continue;
    }
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value) continue;
    data[field.slug] = field.type === 'number' ? Number(value) : value;
  }
  const trap = form.get('_hp');
  if (typeof trap === 'string' && trap) data._hp = trap;
  return data;
}

/** The input type for a field; rich text renders as a textarea instead. */
export function inputType(type: FormField['type']): string {
  switch (type) {
    case 'email':
      return 'email';
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    case 'link':
      return 'url';
    case 'color':
      return 'color';
    case 'bool':
      return 'checkbox';
    default:
      return 'text';
  }
}

/** The error lines of a refused submission, whatever its shape. */
export function submitErrors(body: unknown): string[] {
  const b = (body ?? {}) as { errors?: unknown; message?: unknown };
  if (Array.isArray(b.errors) && b.errors.length > 0) {
    return b.errors.map((e) =>
      typeof e === 'string'
        ? e
        : String((e as { message?: unknown })?.message ?? e)
    );
  }
  return [
    typeof b.message === 'string' && b.message
      ? b.message
      : 'The message could not be sent. Try again, or email us.',
  ];
}
