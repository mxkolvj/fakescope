import type { FastifyInstance } from 'fastify';
import type { VoteRequest, VotesResponse } from '@fakescope/shared';

async function tally(app: FastifyInstance, url: string): Promise<VotesResponse> {
  if (!app.supabase) return { up: 0, down: 0 };
  const { data, error } = await app.supabase.from('votes').select('vote').eq('url', url);
  if (error) throw error;
  let up = 0;
  let down = 0;
  for (const r of data ?? []) {
    if (r.vote === 1) up++;
    else if (r.vote === -1) down++;
  }
  return { up, down };
}

export default async function votesRoute(app: FastifyInstance) {
  app.get<{ Querystring: { url?: string } }>('/votes', async (req, reply) => {
    const url = req.query.url;
    if (!url) return reply.code(400).send({ error: 'url required' });
    try {
      return await tally(app, url);
    } catch (err) {
      app.log.error({ err }, 'votes tally failed');
      return { up: 0, down: 0 };
    }
  });

  app.post<{ Body: VoteRequest }>('/votes', async (req, reply) => {
    const { url, vote, voter_id } = req.body ?? ({} as VoteRequest);
    if (!url || !voter_id || (vote !== 1 && vote !== -1)) {
      return reply.code(400).send({ error: 'url, voter_id, vote (1 | -1) required' });
    }
    if (!app.supabase) return reply.code(503).send({ error: 'supabase not configured' });

    const { error } = await app.supabase
      .from('votes')
      .upsert({ url, voter_id, vote }, { onConflict: 'url,voter_id' });
    if (error) {
      app.log.error({ err: error }, 'vote upsert failed');
      return reply.code(500).send({ error: 'vote failed' });
    }
    return { ok: true };
  });
}
