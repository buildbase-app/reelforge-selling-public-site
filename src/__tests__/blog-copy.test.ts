// @vitest-environment node
import { describe, expect, it } from 'vitest';
import messages from '@/i18n/messages/en';

/**
 * The blog and changelog describe themselves in plain words (studio issues
 * #687 to #690): no "studio" as the product's name, no promise about what
 * we write, and a not-found line that doesn't blame the reader's language.
 */
describe('blog and changelog copy', () => {
  it('uses the plain descriptions', () => {
    expect(messages.blog.meta.description).toBe(
      'News and how-to guides for RenderWeld, the self-hosted video renderer your AI agent drives.'
    );
    expect(messages.blog.description).toBe('Guides and news about RenderWeld.');
    expect(messages.changelog.description).toBe("What's new in RenderWeld.");
    expect(messages.changelog.meta.description).toBe(
      "What's new in RenderWeld."
    );
  });

  it('says plainly when a post is missing or none exist yet', () => {
    expect(messages.errors.blogNotFound.description).toBe(
      "This post doesn't exist or has moved."
    );
    expect(messages.blog.noPosts).toBe('The first posts are on their way.');
  });
});
