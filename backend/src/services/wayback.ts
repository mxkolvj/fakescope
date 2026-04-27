import type { WaybackResult } from '@fakescope/shared';

const EMPTY: WaybackResult = { change_percent: null, snapshots_count: 0, first_snapshot: null };

interface CdxRow {
  timestamp: string;
  original: string;
  length: string;
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`wayback ${res.status}`);
  return (await res.json()) as T;
}

function parseTimestamp(ts: string): string | null {
  // CDX timestamp format: YYYYMMDDhhmmss
  if (ts.length < 8) return null;
  const y = ts.slice(0, 4);
  const mo = ts.slice(4, 6);
  const d = ts.slice(6, 8);
  return `${y}-${mo}-${d}T00:00:00Z`;
}

export async function checkWayback(url: string): Promise<WaybackResult> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8_000);
  try {
    const cdxUrl =
      'https://web.archive.org/cdx/search/cdx?' +
      new URLSearchParams({
        url,
        output: 'json',
        fl: 'timestamp,original,length',
        limit: '100',
        filter: 'statuscode:200',
      }).toString();

    const rows = await fetchJson<string[][]>(cdxUrl, ctrl.signal);
    if (!rows || rows.length <= 1) return EMPTY;

    const data: CdxRow[] = rows.slice(1).map((r) => ({
      timestamp: r[0],
      original: r[1],
      length: r[2],
    }));

    const first = data[0];
    const last = data[data.length - 1];
    const firstLen = Number(first.length) || 0;
    const lastLen = Number(last.length) || 0;
    const changePercent =
      firstLen > 0 ? Math.round((Math.abs(lastLen - firstLen) / firstLen) * 100) : null;

    return {
      change_percent: changePercent,
      snapshots_count: data.length,
      first_snapshot: parseTimestamp(first.timestamp),
    };
  } catch {
    return EMPTY;
  } finally {
    clearTimeout(timeout);
  }
}
