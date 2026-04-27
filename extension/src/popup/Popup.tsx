import { useEffect, useState } from 'react';
import type { AnalyzeResponse } from '@fakescope/shared';
import { ScoreCard } from './ScoreCard';
import { HistoryDiff } from './HistoryDiff';
import { analyzeCurrentTab, voteOnUrl } from '../lib/api';

export function Popup() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeCurrentTab()
      .then(setResult)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  async function handleVote(vote: 1 | -1) {
    if (!result) return;
    await voteOnUrl(result.url, vote);
  }

  return (
    <div className="p-4 font-sans text-sm text-gray-900 bg-white">
      <h1 className="text-lg font-semibold mb-3">FakeScope</h1>
      {loading && <div className="text-gray-500">Analyzing…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {result && (
        <div className="space-y-3">
          <ScoreCard score={result.final_score} verdict={result.llm.verdict} />
          <div>
            <h2 className="font-semibold text-xs uppercase text-gray-500 mb-1">Summary</h2>
            <p className="text-sm">{result.llm.summary}</p>
          </div>
          {result.llm.red_flags.length > 0 && (
            <div>
              <h2 className="font-semibold text-xs uppercase text-red-600 mb-1">Red flags</h2>
              <ul className="list-disc pl-5 text-sm">
                {result.llm.red_flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {result.llm.positive_signals.length > 0 && (
            <div>
              <h2 className="font-semibold text-xs uppercase text-green-700 mb-1">Positive signals</h2>
              <ul className="list-disc pl-5 text-sm">
                {result.llm.positive_signals.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          <HistoryDiff wayback={result.wayback} />
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-xs text-gray-500">Vote:</span>
            <button
              className="px-2 py-1 text-xs rounded bg-green-100 hover:bg-green-200"
              onClick={() => handleVote(1)}
            >
              👍 {result.community.up}
            </button>
            <button
              className="px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200"
              onClick={() => handleVote(-1)}
            >
              👎 {result.community.down}
            </button>
            {result.cached && <span className="ml-auto text-xs text-gray-400">cached</span>}
          </div>
        </div>
      )}
    </div>
  );
}
