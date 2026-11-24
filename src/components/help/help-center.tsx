import { getTranslations } from 'next-intl/server';
import {
  Bot,
  BookOpen,
  FileText,
  MessageCircleQuestion,
  Quote,
} from 'lucide-react';
import type {
  DocFolder,
  DocPost,
  RichContent,
  Testimonial,
} from '@/lib/platform/content';
import type { FaqSectionData } from '@/lib/platform/faqs';
import { renderMarkdown } from '@/lib/platform/markdown';
import { MarkdownHtml } from '@/components/content/markdown-html';
import { DocsBrowser } from './docs-browser';
import { FaqSection } from './faq-section';

interface HelpCenterProps {
  configured: boolean;
  storeFaq: FaqSectionData;
  agentsFaq: FaqSectionData;
  policy: RichContent | null;
  docs: { folders: DocFolder[]; posts: DocPost[] };
  testimonials: Testimonial[];
}

/**
 * Bodies from the console (the policy block, docs) are Markdown: they are
 * rendered and sanitised here on the server, never injected as HTML.
 */
export async function HelpCenter({
  configured,
  storeFaq,
  agentsFaq,
  policy,
  docs,
  testimonials,
}: HelpCenterProps) {
  const t = await getTranslations('help');
  const policyHtml = policy ? renderMarkdown(policy.content).html : '';
  const empty = !policyHtml && docs.posts.length === 0;

  return (
    <div className="mt-10 space-y-14">
      <section id="faq" className="scroll-mt-20">
        <SectionHeading icon={MessageCircleQuestion} title={t('faq.title')} />
        <FaqSection items={storeFaq.items} />
      </section>

      {agentsFaq.items.length > 0 && (
        <section id="agents" className="scroll-mt-20">
          <SectionHeading icon={Bot} title="Using RenderWeld with your agent" />
          <FaqSection items={agentsFaq.items} />
        </section>
      )}

      {(!configured || empty) && (
        <p className="text-muted-foreground text-sm">
          {configured ? t('notConfigured.empty') : t('notConfigured.token')}
        </p>
      )}
      {policy && policyHtml && (
        <section id="policy" className="scroll-mt-20">
          <SectionHeading icon={FileText} title={policy.title} />
          <MarkdownHtml
            html={policyHtml}
            className="mt-4 max-w-none text-[15px] leading-relaxed [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:my-3"
          />
        </section>
      )}

      {docs.posts.length > 0 && (
        <section id="docs" className="scroll-mt-20">
          <SectionHeading icon={BookOpen} title={t('docs.title')} />
          <DocsBrowser
            labels={{ title: t('docs.title'), empty: t('docs.empty') }}
            folders={docs.folders}
            posts={docs.posts.map((p) => ({
              ...p,
              content: renderMarkdown(p.content).html,
            }))}
          />
        </section>
      )}

      {testimonials.length > 0 && (
        <section id="testimonials" className="scroll-mt-20">
          <SectionHeading icon={Quote} title={t('testimonials.title')} />
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <li
                key={item._id}
                className="bg-card flex flex-col rounded-xl border p-5"
              >
                <p className="text-sm leading-relaxed">“{item.content}”</p>
                <p className="mt-4 text-sm font-medium">{item.name}</p>
                <p className="text-muted-foreground text-xs">
                  {item.position}
                  {typeof item.company === 'object' && item.company?.name
                    ? ` · ${item.company.name}`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
      <Icon className="text-muted-foreground h-5 w-5" /> {title}
    </h2>
  );
}
