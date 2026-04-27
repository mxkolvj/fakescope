import { config } from '../config.js';
import type { LlmResult } from '@fakescope/shared';

const SYSTEM_PROMPT = `You are a fact-checking assistant evaluating news article credibility.
Respond with ONLY a JSON object matching this exact shape — no prose, no markdown:
{
  "score": <integer 0-100, where 100 = highly credible, 0 = clearly fabricated>,
  "verdict": "<one short sentence>",
  "red_flags": ["<concise red flag>", ...],
  "positive_signals": ["<concise positive signal>", ...],
  "summary": "<2-3 sentence assessment>"
}
Consider: sourcing, emotional manipulation, factual claims, internal consistency, named experts, plausibility.`;

const FALLBACK: LlmResult = {
  score: 50,
  verdict: 'Unable to analyze',
  red_flags: [],
  positive_signals: [],
  summary: 'LLM analysis unavailable — defaulting to neutral score.',
};

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no JSON object found');
    return JSON.parse(match[0]);
  }
}

function coerce(parsed: unknown): LlmResult {
  if (!parsed || typeof parsed !== 'object') return FALLBACK;
  const p = parsed as Record<string, unknown>;
  const score = Math.max(0, Math.min(100, Number(p.score ?? 50)));
  return {
    score: Number.isFinite(score) ? Math.round(score) : 50,
    verdict: typeof p.verdict === 'string' ? p.verdict : FALLBACK.verdict,
    red_flags: Array.isArray(p.red_flags) ? p.red_flags.map(String).slice(0, 10) : [],
    positive_signals: Array.isArray(p.positive_signals)
      ? p.positive_signals.map(String).slice(0, 10)
      : [],
    summary: typeof p.summary === 'string' ? p.summary : FALLBACK.summary,
  };
}

export async function analyzeWithLlm(input: {
  url: string;
  title: string;
  text: string;
}): Promise<LlmResult> {
  const article = input.text.slice(0, 3000);
  const userPrompt = `URL: ${input.url}\nTitle: ${input.title}\n\nArticle:\n${article}`;

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 30_000);

  try {
    const res = await fetch(`${config.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: config.ollamaModel,
        format: 'json',
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        options: { temperature: 0.2 },
      }),
    });
    if (!res.ok) throw new Error(`ollama ${res.status}`);
    const body = (await res.json()) as { message?: { content?: string } };
    const content = body.message?.content ?? '';
    return coerce(extractJson(content));
  } catch (err) {
    return { ...FALLBACK, summary: `LLM error: ${(err as Error).message}` };
  } finally {
    clearTimeout(timeout);
  }
}
