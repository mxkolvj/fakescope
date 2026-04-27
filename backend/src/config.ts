import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  ollamaUrl: required('OLLAMA_URL', 'http://localhost:11434'),
  ollamaModel: required('OLLAMA_MODEL', 'llama3.1:8b'),
  redisUrl: required('REDIS_URL', 'redis://localhost:6379'),
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseKey: process.env.SUPABASE_KEY ?? '',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'chrome-extension://*')
    .split(',')
    .map((s) => s.trim()),
};
