import {
  SCORE_WEIGHTS,
  type AnalyzeResponse,
  type CommunityResult,
  type DomainResult,
  type LlmResult,
} from "@fakescope/shared";

export function communityScore(up: number, down: number): CommunityResult {
  const total = up + down;
  const ratio = total === 0 ? 0.5 : up / total;
  const confidence = Math.min(1, total / 20);
  const community_score = Math.round(50 + (ratio - 0.5) * 100 * confidence);
  return { up, down, community_score };
}

export function aggregate(args: {
  url: string;
  llm: LlmResult;
  domain: DomainResult;
  community: CommunityResult;
  cached?: boolean;
}): AnalyzeResponse {
  const final =
    args.llm.score * SCORE_WEIGHTS.llm +
    args.domain.domain_score * SCORE_WEIGHTS.domain +
    args.community.community_score * SCORE_WEIGHTS.community;

  return {
    url: args.url,
    final_score: Math.max(0, Math.min(100, Math.round(final))),
    llm: args.llm,
    domain: args.domain,
    community: args.community,
    cached: args.cached ?? false,
    generated_at: new Date().toISOString(),
  };
}
