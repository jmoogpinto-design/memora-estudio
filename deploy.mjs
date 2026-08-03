import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

// Lê .env manualmente sem dependências externas
const env = {};
try {
  readFileSync(".env", "utf8").split("\n").forEach((line) => {
    const [k, ...v] = line.split("=");
    if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^"|"$/g, "");
  });
} catch {}

const wranglerPath = ".output/server/wrangler.json";
const wrangler = JSON.parse(readFileSync(wranglerPath, "utf8"));

wrangler.vars = {
  SUPABASE_URL: env.SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: env.SUPABASE_PUBLISHABLE_KEY,
};

wrangler.routes = [
  { pattern: "app.memoraestudio.com.br/*", zone_name: "memoraestudio.com.br" }
];
wrangler.workers_dev = true;

writeFileSync(wranglerPath, JSON.stringify(wrangler, null, 2));
console.log("✓ Variáveis injetadas:", wrangler.vars);

execSync(`npx wrangler deploy --config ${wranglerPath}`, { stdio: "inherit" });
