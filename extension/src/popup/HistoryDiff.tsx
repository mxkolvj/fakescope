import type { WaybackResult } from '@fakescope/shared';

interface Props {
  wayback: WaybackResult | null;
}

export function HistoryDiff({ wayback }: Props) {
  if (!wayback || wayback.snapshots_count === 0) {
    return (
      <div className="p-2 rounded bg-gray-50 text-xs text-gray-500">
        No Wayback Machine history found for this URL.
      </div>
    );
  }
  const warn = (wayback.change_percent ?? 0) > 30;
  return (
    <div className={`p-2 rounded text-xs ${warn ? 'bg-amber-50 text-amber-900' : 'bg-gray-50 text-gray-700'}`}>
      <div className="font-semibold uppercase tracking-wide text-[10px] mb-1">Wayback history</div>
      <div>{wayback.snapshots_count} snapshots since {wayback.first_snapshot?.slice(0, 10) ?? '?'}</div>
      {wayback.change_percent !== null && (
        <div>
          Content drift: {wayback.change_percent}% {warn && '⚠️ significant changes'}
        </div>
      )}
    </div>
  );
}
