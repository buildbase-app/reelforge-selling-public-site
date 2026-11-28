import 'server-only';
import { siteConfig } from '@/config/site';
import {
  FAQ_COLLECTIONS,
  getFaqs,
  type FaqCollectionKey,
} from '@/lib/platform/content';
import { renderMarkdown } from '@/lib/platform/markdown';

/**
 * FAQs: read from the BuildBase FAQ collection for each page, with the local
 * defaults below whenever that collection is missing, empty or unreachable.
 * The visible accordion and the FAQPage JSON-LD are built from the same
 * rendered list, so they always say the same thing.
 *
 * Answers are Markdown (as in the console) and are rendered with
 * `renderMarkdown`, so console and local answers go through one sanitiser.
 *
 * Keep every default true today (the private design brief, §7): no
 * prices, no dates, no untested clients or features. Verified as of
 * 2026-11-21: Docker end-to-end run; headless Claude Code made an 18-second
 * reel with all four engines over MCP only. Not verified: rendering on the
 * buyer's AWS (Lambda), captions, live ElevenLabs voice-over, Codex, Cursor.
 */

export interface FaqEntry {
  id: string;
  question: string;
  /** Markdown. */
  answer: string;
}

export interface RenderedFaq {
  id: string;
  question: string;
  /** Sanitised HTML. */
  html: string;
  /** Plain text, for JSON-LD. */
  text: string;
}

export interface FaqSectionData {
  collection: string;
  /** Where the questions came from. */
  source: 'buildbase' | 'default';
  items: RenderedFaq[];
}

const contactAnswer = siteConfig.contact.support
  ? `Email [${siteConfig.contact.support}](mailto:${siteConfig.contact.support}).`
  : 'Use the [contact page](/contact), or see [Help](/help).';

const Q = {
  what: {
    id: 'what',
    question: 'What is RenderWeld?',
    answer:
      'RenderWeld is a source-available video renderer that your AI agent drives over MCP and REST. You self-host it (in Docker, on a computer or cloud server you control). The agent writes the manifest: every scene, its timing and its engine. RenderWeld renders it with four engines (Remotion, Motion Canvas, HTML and HyperFrames) at the size and frame rate you ask for, into MP4, ProRes MOV, WebM, GIF, a PNG sequence or audio only. It is free for personal use; commercial use needs a one-time Commercial licence.',
  },
  buy: {
    id: 'buy',
    question: 'Can I buy it now?',
    answer:
      'RenderWeld is in early access. The [pricing page](/pricing) shows the free Personal licence and the Commercial licences, straight from the store; while it says "Not on sale yet", [join the waitlist](/waitlist) to hear first.',
  },
  delivery: {
    id: 'delivery',
    question: 'What do I get, and how?',
    answer: `A licence key, from your order page and your account: a free Personal key for noncommercial use, or a paid Commercial key, bought once. Every released RenderWeld Docker image activates with a key from BuildBase. The source and install documentation are public on [GitHub](${siteConfig.repo.url}). You run it yourself: there is no render service run by us. The [licences](/licence) say what you may do with it.`,
  },
  sourceCode: {
    id: 'source-code',
    question: 'Can I read the source code?',
    answer: `Yes. RenderWeld is source-available: every line is public on [GitHub](${siteConfig.repo.url}). You may use it for noncommercial purposes under the PolyForm Noncommercial License 1.0.0; any commercial use needs a Commercial licence. You may not resell, redistribute or rebrand it, or offer it as a hosted service, and forks must be renamed. See [LICENSING.md](${siteConfig.repo.licensing}).`,
  },
  commercialUse: {
    id: 'commercial-use',
    question: 'What counts as commercial use?',
    answer:
      'Any use by or for a business, or any use meant to earn money, directly or indirectly. For example: videos for a monetised social account, client or agency work, marketing for a business, use inside a company, or as part of a paid product or service. When in doubt, it is commercial, or [ask us](/contact). Charities, schools, public research and government bodies using it noncommercially can use the free Personal licence.',
  },
  personalFree: {
    id: 'personal-free',
    question: 'Is the Personal licence really free?',
    answer:
      'Yes. Sign in with a BuildBase account and press "Get it free" on the [pricing page](/pricing): there is no payment page. You get a Personal licence key for one server, for noncommercial use only. If you start using RenderWeld to earn money, upgrade to a Commercial licence.',
  },
  ai: {
    id: 'ai',
    question: 'Do I need an AI subscription or API key?',
    answer:
      'RenderWeld does not include an AI model. The agent you connect (for example Claude Code) runs under your own account, and any other AI service you connect is optional and uses your own key.',
  },
  remotion: {
    id: 'remotion',
    question: 'Do I need a Remotion licence?',
    answer:
      'RenderWeld includes Remotion-based templates. Remotion is free for individuals and companies of up to 3 people; larger companies need their own Remotion licence ([remotion.dev/license](https://www.remotion.dev/license)). RenderWeld also includes Motion Canvas, HTML and HyperFrames engines.',
  },
  refund: {
    id: 'refund',
    question: 'Can I get a refund?',
    answer:
      'For a Commercial licence, yes, if RenderWeld does not run on a supported system and our support cannot fix it. Personal keys are free, so there is nothing to refund. See the [refund policy](/refund) (draft, pending review).',
  },
  contact: {
    id: 'contact',
    question: 'How do I reach you?',
    answer: contactAnswer,
  },
  agentDrives: {
    id: 'agent',
    question: 'How does my AI agent use it?',
    answer:
      'RenderWeld serves a REST API and an MCP server on your machine. Your agent creates a project, adds scenes, checks the project and renders it, then fetches the file. In our own test, headless Claude Code made an 18-second reel that used all four engines, over MCP only.',
  },
  whereRuns: {
    id: 'where',
    question: 'Where does it run?',
    answer:
      'On a computer or cloud server you control, in Docker. RenderWeld itself runs no render service for you. Rendering on serverless cloud services (for example AWS Lambda) is not supported yet.',
  },
  subscription: {
    id: 'subscription',
    question: 'Is it a subscription?',
    answer:
      'No. Personal use is free, and a Commercial licence is paid once. There are no per-video fees to RenderWeld. Remotion (for companies over 3 people) and any voice provider you use bill you directly.',
  },
  whichAgents: {
    id: 'which-agents',
    question: 'Which AI agents can drive RenderWeld?',
    answer:
      'Any MCP client, or anything that can call a REST API, can connect. The one we have tested is Claude Code over MCP. Codex and Cursor are not tested yet; they will be listed here once they are.',
  },
  connect: {
    id: 'connect',
    question: 'How does an agent connect?',
    answer:
      'Add the RenderWeld MCP server running on your machine to your agent, with an API key you create in RenderWeld, then ask for a reel. Agents that prefer plain HTTP can use the REST API instead.',
  },
  agentDecides: {
    id: 'decides',
    question: 'What does the agent decide, and what does RenderWeld do?',
    answer:
      'The agent decides every scene, its timing and which engine renders it. RenderWeld checks the project, renders each scene, joins them into one file and checks the result.',
  },
  notYet: {
    id: 'not-yet',
    question: 'What is not ready yet?',
    answer:
      'Rendering on serverless functions (Remotion Lambda) is not built. ElevenLabs voice-over is tested against a mock, not live. AI image and video providers plug into the same interface as voice, but none ships yet. Codex and Cursor are not tested. We will only list them as features once they are.',
  },
  whatIncluded: {
    id: 'included',
    question: 'What does a licence include?',
    answer:
      'A licence key that activates the released RenderWeld Docker image. The Personal key is free and for noncommercial use on one server; Commercial tiers differ by how many servers their key allows, and what each adds is listed on its card, straight from the store. Every tier runs the same code.',
  },
  otherCosts: {
    id: 'other-costs',
    question: 'What else might I pay for?',
    answer:
      'There are no per-video fees to RenderWeld. You may still pay for a Remotion licence (companies over 3 people), your AI agent’s own account, any voice provider you use, and the computer or server it runs on.',
  },
} satisfies Record<string, FaqEntry>;

export const DEFAULT_FAQS: Record<FaqCollectionKey, FaqEntry[]> = {
  store: [
    Q.what,
    Q.buy,
    Q.delivery,
    Q.sourceCode,
    Q.commercialUse,
    Q.ai,
    Q.remotion,
    Q.refund,
    Q.contact,
  ],
  home: [
    Q.what,
    Q.agentDrives,
    Q.whereRuns,
    Q.subscription,
    Q.sourceCode,
    Q.commercialUse,
    Q.buy,
  ],
  pricing: [
    Q.personalFree,
    Q.commercialUse,
    Q.whatIncluded,
    Q.subscription,
    Q.otherCosts,
    Q.sourceCode,
    Q.refund,
  ],
  agents: [Q.whichAgents, Q.connect, Q.agentDecides, Q.notYet],
};

function render(entries: FaqEntry[]): RenderedFaq[] {
  return entries
    .filter((e) => e.question?.trim() && e.answer?.trim())
    .map((e) => {
      const { html, text } = renderMarkdown(e.answer);
      return { id: e.id, question: e.question.trim(), html, text };
    });
}

/** One page's FAQ: the BuildBase collection, or its local defaults. */
export async function getFaqSection(
  key: FaqCollectionKey
): Promise<FaqSectionData> {
  const collection = FAQ_COLLECTIONS[key];
  const remote = render(
    (await getFaqs(collection)).map((f) => ({
      id: f._id,
      question: f.question,
      answer: f.answer,
    }))
  );
  if (remote.length > 0) {
    return { collection, source: 'buildbase', items: remote };
  }
  return { collection, source: 'default', items: render(DEFAULT_FAQS[key]) };
}
