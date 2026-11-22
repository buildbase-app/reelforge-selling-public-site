/**
 * JSON-LD for a `<script type="application/ld+json">` element. Hardening from
 * a private security review (SEC-17).
 *
 * Some JSON-LD text comes from the BuildBase console (FAQs). Every character
 * that matters to the HTML parser is written as a JSON escape, so no text can
 * end the script element or open a comment, whatever the library around it
 * does. The output is still valid JSON with the same value.
 */
const ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

export function serializeJsonLd(data: unknown): string {
  const json = JSON.stringify(data) ?? 'null';
  return json.replace(/[<>&\u2028\u2029]/g, (c) => ESCAPES[c]);
}
