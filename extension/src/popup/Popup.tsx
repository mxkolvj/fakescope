import { useEffect, useState } from "react";
import type { AnalyzeResponse } from "@fakescope/shared";
import { ScoreCard } from "./ScoreCard";
import { HistoryDiff } from "./HistoryDiff";
import { analyzeCurrentTab, NotArticleError, voteOnUrl } from "../lib/api";
import { AlertCircle, AlertTriangle } from "lucide-react";

export function Popup() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notArticle, setNotArticle] = useState(false);

  useEffect(() => {
    analyzeCurrentTab()
      .then(setResult)
      .catch((e) => {
        if (e instanceof NotArticleError) setNotArticle(true);
        else setError((e as Error).message);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleVote(vote: 1 | -1) {
    if (!result) return;
    await voteOnUrl(result.url, vote);
  }

  return (
    <div className="flex flex-col gap-4 justify-center p-5 text-sm text-gray-900 bg-white rounded-3xl">
      <div className="flex items-center gap-2">
        <img
          src="../../icons/fakescope-icon.svg"
          alt="FakeScope logo"
          className="aspect-square h-10"
        />
        <h1 className="text-xl font-bold ">
          <span className="text-teal-700">Fake</span>Scope
        </h1>
      </div>
      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-200">
            <div className="w-[88px] h-[88px] rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-8 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
          <div className="h-3 bg-gray-200 rounded w-3/5" />
        </div>
      )}
      {notArticle && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 flex gap-2 items-start">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>Navigate to a news article and click FakeScope again.</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-700 text-xs text-red-300">
          <div className="font-semibold mb-1 text-lg text-white flex gap-1.5 items-center">
            <AlertTriangle size={20} strokeWidth={2.5} />
            Wystąpił błąd
          </div>
          <div>{error}</div>
        </div>
      )}
      {result && (
        <div className="space-y-3">
          <ScoreCard score={result.final_score} verdict={result.llm.verdict} />
          <div>
            <h2 className="font-semibold text-xs uppercase text-gray-500 mb-1">
              Summary
            </h2>
            <p className="text-sm">{result.llm.summary}</p>
          </div>
          {result.llm.red_flags.length > 0 && (
            <div>
              <h2 className="font-semibold text-xs uppercase text-red-600 mb-1">
                Red flags
              </h2>
              <ul className="list-disc pl-5 text-sm">
                {result.llm.red_flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {result.llm.positive_signals.length > 0 && (
            <div>
              <h2 className="font-semibold text-xs uppercase text-green-700 mb-1">
                Positive signals
              </h2>
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
            {result.cached && (
              <span className="ml-auto text-xs text-gray-400">cached</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
