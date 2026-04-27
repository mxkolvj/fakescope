interface Props {
  score: number;
  verdict: string;
}

function colorFor(score: number): { ring: string; text: string } {
  if (score >= 70) return { ring: 'stroke-green-500', text: 'text-green-700' };
  if (score >= 40) return { ring: 'stroke-yellow-500', text: 'text-yellow-700' };
  return { ring: 'stroke-red-500', text: 'text-red-700' };
}

export function ScoreCard({ score, verdict }: Props) {
  const { ring, text } = colorFor(score);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-200">
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r={radius} className="stroke-gray-200 fill-none" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          className={`${ring} fill-none transition-all`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col">
        <span className={`text-3xl font-bold ${text}`}>{score}</span>
        <span className="text-xs text-gray-600">{verdict}</span>
      </div>
    </div>
  );
}
