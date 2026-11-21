import { agent } from '@/lib/agent';

/**
 * robots.txt, served by the SDK from the agent stack's `discovery.robots`
 * (src/lib/agent): Content Signals, the AI crawler groups and the sitemap.
 */
export const GET = agent.serveAgentPath;
export const OPTIONS = agent.serveAgentPath;
