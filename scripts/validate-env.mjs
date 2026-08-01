import { existsSync } from 'node:fs';
import process from 'node:process';
import { config } from 'dotenv';

if (existsSync('.env.local')) config({ path: '.env.local' });

const required = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'PUBLIC_SITE_URL',
  'PUBLIC_BASE_PATH',
];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`);
}

const url = new URL(process.env.PUBLIC_SUPABASE_URL);
if (url.protocol !== 'https:' && !['127.0.0.1', 'localhost'].includes(url.hostname)) {
  throw new Error('PUBLIC_SUPABASE_URL precisa usar HTTPS fora do ambiente local.');
}

const publicKey = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!publicKey.startsWith('sb_publishable_') && !publicKey.startsWith('eyJ')) {
  throw new Error('PUBLIC_SUPABASE_PUBLISHABLE_KEY não tem um formato reconhecido.');
}
if (
  Object.keys(process.env).some((name) => name.startsWith('PUBLIC_') && /SERVICE_ROLE/i.test(name))
) {
  throw new Error('Uma chave privilegiada nunca pode ser exposta como PUBLIC_.');
}

const siteURL = new URL(process.env.PUBLIC_SITE_URL);
if (siteURL.protocol !== 'https:' && !['127.0.0.1', 'localhost'].includes(siteURL.hostname)) {
  throw new Error('PUBLIC_SITE_URL precisa usar HTTPS fora do ambiente local.');
}
if (!process.env.PUBLIC_BASE_PATH.startsWith('/')) {
  throw new Error('PUBLIC_BASE_PATH precisa começar com /.');
}

console.log('Ambiente público validado sem expor credenciais.');
