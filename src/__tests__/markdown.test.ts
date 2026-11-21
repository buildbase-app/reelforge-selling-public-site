import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '@/lib/platform/markdown';

/**
 * BuildBase bodies are Markdown (raw HTML allowed). They are rendered on the
 * server and sanitised; nothing executable may reach the page.
 */
describe('renderMarkdown', () => {
  it('renders a code span, a code block and links', () => {
    const { html, text } = renderMarkdown(
      'Run `docker compose up`, then read [the docs](https://example.com/docs) or [pricing](/pricing).\n\n```bash\ncurl localhost\n```'
    );
    expect(html).toContain('<code>docker compose up</code>');
    expect(html).toContain('<pre><code class="language-bash">curl localhost');
    expect(html).toContain(
      '<a href="https://example.com/docs" target="_blank" rel="noopener noreferrer">the docs</a>'
    );
    expect(html).toContain('<a href="/pricing">pricing</a>');
    expect(text).toBe(
      'Run docker compose up, then read the docs or pricing. curl localhost'
    );
  });

  it('strips scripts, iframes, event handlers and javascript: links', () => {
    const { html } = renderMarkdown(
      'Hi <script>alert(1)</script><iframe src="https://evil.test"></iframe> <b onclick="steal()">bold</b> [x](javascript:alert(1)) <a href="javascript:alert(2)">y</a>'
    );
    expect(html).not.toMatch(/<script|<iframe|onclick|javascript:|alert/i);
    expect(html).toContain('<b>bold</b>');
  });

  it('keeps characters that look like HTML in text', () => {
    expect(renderMarkdown('a < b && `Array<string>`').html).toContain(
      '<code>Array&#x3C;string></code>'
    );
  });

  it('returns nothing for an empty body', () => {
    expect(renderMarkdown('  ')).toEqual({ html: '', text: '' });
    expect(renderMarkdown(undefined)).toEqual({ html: '', text: '' });
  });
});
