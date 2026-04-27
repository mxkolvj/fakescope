import fp from 'fastify-plugin';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient | null;
  }
}

export default fp(async (app) => {
  const client =
    config.supabaseUrl && config.supabaseKey
      ? createClient(config.supabaseUrl, config.supabaseKey, { auth: { persistSession: false } })
      : null;
  if (!client) app.log.warn('supabase not configured — votes endpoints will return empty data');
  app.decorate('supabase', client);
});
