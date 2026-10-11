// Mantém o projeto Supabase (plano gratuito) ativo: o Supabase pausa projetos
// sem atividade por ~7 dias. Este Worker roda via Cron Trigger e faz uma
// consulta real ao Postgres (via PostgREST) a cada execução.

async function ping(env) {
  const headers = { apikey: env.SUPABASE_PUBLISHABLE_KEY };
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/orders?select=id&limit=1`, { headers });
  const body = await res.text();
  if (!res.ok) throw new Error(`Supabase respondeu ${res.status}: ${body}`);
  console.log(`[keepalive] ok ${res.status}`);
  return res.status;
}

export default {
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(ping(env));
  },
  // Permite testar manualmente abrindo a URL do worker.
  async fetch(_request, env) {
    try {
      const status = await ping(env);
      return new Response(`ok ${status}\n`);
    } catch (err) {
      return new Response(`${err}\n`, { status: 502 });
    }
  },
};
