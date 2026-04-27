import type { FastifyInstance } from 'fastify';
import { checkDomain } from '../services/domain.js';

export default async function domainRoute(app: FastifyInstance) {
  app.get<{ Querystring: { url?: string } }>('/domain', async (req, reply) => {
    const url = req.query.url;
    if (!url) return reply.code(400).send({ error: 'url required' });
    return await checkDomain(url);
  });
}
