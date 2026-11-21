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
 * Keep every default true today (docs/research/DESIGN_BRIEF.md §7): no
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
    question: 'What is ReelForge?',
    answer:
      'ReelForge is a self-hosted studio for short vertical videos. It runs as a Docker image on a computer or server you control, and your AI agent drives it over REST and MCP: the agent plans every scene and its timing, and ReelForge renders the scenes with four engines (Remotion, Motion Canvas, HTML and HyperFrames) into one MP4.',
  },
  buy: {
    id: 'buy',
    question: 'Can I buy it now?',
    answer:
      'ReelForge is in early access. The [pricing page](/pricing) shows what can be bought, straight from the store; while it says "Not on sale yet", [join the waitlist](/waitlist) to hear first.',
  },
  delivery: {
    id: 'delivery',
    question: 'What do I get, and how?',
    answer:
      'You buy a licence once. You get the ReelForge Docker image, a licence key and the install documentation, from your order page and your account. You run it yourself: there is no render service run by us. Installation help and support can be bought as separate services. The [licence](/licence) says what you may do with it.',
  },
  sourceCode: {
    id: 'source-code',
    question: 'Do I get the source code?',
    answer:
      'No. ReelForge is sold as a locked Docker image with a licence key. You run it on your own hardware and keep every video you make, but the source code is not included.',
  },
  ai: {
    id: 'ai',
    question: 'Do I need an AI subscription or API key?',
    answer:
      'ReelForge does not include an AI model. The agent you connect (for example Claude Code) runs under your own account, and any other AI service you connect is optional and uses your own key.',
  },
  remotion: {
    id: 'remotion',
    question: 'Do I need a Remotion licence?',
    answer:
      'ReelForge includes Remotion-based templates. Remotion is free for individuals and companies of up to 3 people; larger companies need their own Remotion licence ([remotion.dev/license](https://www.remotion.dev/license)). ReelForge also includes Motion Canvas, HTML and HyperFrames engines.',
  },
  refund: {
    id: 'refund',
    question: 'Can I get a refund?',
    answer:
      'Yes, if ReelForge does not run on a supported system and our support cannot fix it. See the [refund policy](/refund) (draft, pending review).',
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
      'ReelForge serves a REST API and an MCP server on your machine. Your agent creates a project, adds scenes, checks the project and renders it, then fetches the MP4. In our own test, headless Claude Code made an 18-second reel that used all four engines, over MCP only.',
  },
  whereRuns: {
    id: 'where',
    question: 'Where does it run?',
    answer:
      'On a computer or server you control, as a Docker image. ReelForge itself runs no render service for you. Rendering on your own cloud account (for example AWS Lambda) is not supported yet.',
  },
  subscription: {
    id: 'subscription',
    question: 'Is it a subscription?',
    answer:
      'No. You pay once for a licence and there are no per-video fees to ReelForge. Remotion (for companies over 3 people) and any voice provider you use bill you directly.',
  },
  whichAgents: {
    id: 'which-agents',
    question: 'Which AI agents can drive ReelForge?',
    answer:
      'Any client that can call a REST API or an MCP server can connect. The one we have tested is Claude Code over MCP. Codex and Cursor are not tested yet; they will be listed here once they are.',
  },
  connect: {
    id: 'connect',
    question: 'How does an agent connect?',
    answer:
      'Add the ReelForge MCP server running on your machine to your agent, with an API key you create in ReelForge, then ask for a reel. Agents that prefer plain HTTP can use the REST API instead.',
  },
  agentDecides: {
    id: 'decides',
    question: 'What does the agent decide, and what does ReelForge do?',
    answer:
      'The agent decides every scene, its timing and which engine renders it. ReelForge checks the project, renders each scene and assembles one MP4.',
  },
  notYet: {
    id: 'not-yet',
    question: 'What is not ready yet?',
    answer:
      'Rendering on your own AWS account (Remotion Lambda), burned-in captions and live ElevenLabs voice-over are not verified yet, and Codex and Cursor are not tested. We will only list them as features once they are.',
  },
  whatIncluded: {
    id: 'included',
    question: 'What does a licence include?',
    answer:
      'The ReelForge Docker image, a licence key and the install documentation. What each option adds (seats, updates, support) is listed on its card, straight from the store.',
  },
  otherCosts: {
    id: 'other-costs',
    question: 'What else might I pay for?',
    answer:
      'There are no per-video fees to ReelForge. You may still pay for a Remotion licence (companies over 3 people), your AI agent’s own account, any voice provider you use, and the computer or server it runs on.',
  },
} satisfies Record<string, FaqEntry>;

export const DEFAULT_FAQS: Record<FaqCollectionKey, FaqEntry[]> = {
  store: [
    Q.what,
    Q.buy,
    Q.delivery,
    Q.sourceCode,
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
    Q.buy,
  ],
  pricing: [
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
