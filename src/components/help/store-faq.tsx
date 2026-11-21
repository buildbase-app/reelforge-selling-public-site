import { Link } from '@/i18n/routing';
import { RemotionNotice } from '@/components/remotion-notice';
import { SupportContact } from '@/components/support-contact';

const linkClass = 'text-foreground underline underline-offset-2';

/**
 * The store's own FAQ, written here rather than in the console so it is
 * always present. Keep every answer true today: no prices, dates or
 * features that are not decided.
 */
const FAQ: { id: string; question: string; answer: React.ReactNode }[] = [
  {
    id: 'what',
    question: 'What is ReelForge?',
    answer: (
      <p>
        A studio for short vertical videos that you run on your own computer or
        server. You describe a video as a storyboard; ReelForge renders the
        scenes and assembles them into one MP4.
      </p>
    ),
  },
  {
    id: 'buy',
    question: 'Can I buy it now?',
    answer: (
      <p>
        Not yet. ReelForge is in early access. The{' '}
        <Link href="/pricing" className={linkClass}>
          pricing page
        </Link>{' '}
        shows what can be bought as soon as it is on sale;{' '}
        <Link href="/waitlist" className={linkClass}>
          join the waitlist
        </Link>{' '}
        to hear first.
      </p>
    ),
  },
  {
    id: 'delivery',
    question: 'What do I get, and how?',
    answer: (
      <p>
        You buy ReelForge once and download the source code with install
        documentation from your order page and your account. You run it
        yourself; there is no render service run by us. Help with installation
        and support can be bought as separate services. The{' '}
        <Link href="/licence" className={linkClass}>
          licence
        </Link>{' '}
        says what you may do with the code.
      </p>
    ),
  },
  {
    id: 'ai',
    question: 'Do I need an AI subscription or API key?',
    answer: (
      <p>
        No AI provider is required by the store. Any AI service you connect to
        ReelForge is optional and uses your own account.
      </p>
    ),
  },
  {
    id: 'remotion',
    question: 'Do I need a Remotion licence?',
    answer: <RemotionNotice className="mt-2" />,
  },
  {
    id: 'refund',
    question: 'Can I get a refund?',
    answer: (
      <p>
        Yes, if ReelForge does not run on a supported system and our support
        cannot fix it. See the{' '}
        <Link href="/refund" className={linkClass}>
          refund policy
        </Link>{' '}
        (draft, pending review).
      </p>
    ),
  },
  {
    id: 'contact',
    question: 'How do I reach you?',
    answer: (
      <p>
        <SupportContact />
      </p>
    ),
  },
];

export function StoreFaq() {
  return (
    <ul className="mt-4 divide-y rounded-xl border">
      {FAQ.map((item) => (
        <li key={item.id}>
          <details className="group">
            <summary className="hover:bg-muted/50 flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
              {item.question}
              <span
                aria-hidden
                className="text-muted-foreground transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <div className="text-muted-foreground px-4 pb-4 text-sm leading-relaxed">
              {item.answer}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
