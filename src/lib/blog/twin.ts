import type { BlogPost } from './posts';

/**
 * A post as Markdown for agents (`/api/content/blog/<slug>`, or the post's
 * own URL with `Accept: text/markdown`): a title, the summary, the facts a
 * reader needs (date, authors, tags, version), then the body exactly as
 * written in the console.
 */
export function postMarkdown(post: BlogPost, url: string): string {
  const facts = [
    `**URL:** ${url}`,
    `**Published:** ${post.date.slice(0, 10)}`,
    ...(post.updated ? [`**Updated:** ${post.updated.slice(0, 10)}`] : []),
    ...(post.version ? [`**Version:** ${post.version}`] : []),
    ...(post.authors.length > 0
      ? [`**Author:** ${post.authors.map((a) => a.name).join(', ')}`]
      : []),
    ...(post.tags.length > 0
      ? [`**Tags:** ${post.tags.map((t) => t.title).join(', ')}`]
      : []),
    `**Reading time:** ${post.readingTime}`,
  ];
  return [
    `# ${post.title}`,
    '',
    ...(post.description ? [`> ${post.description}`, ''] : []),
    facts.join('  \n'),
    '',
    '---',
    '',
    post.markdown.trim(),
    '',
  ].join('\n');
}
