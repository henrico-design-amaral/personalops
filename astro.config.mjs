import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  base: process.env.PUBLIC_BASE_PATH || '/',
  trailingSlash: 'always',
  outDir: './dist',
  publicDir: './public',
  integrations: [],
  vite: {
    build: {
      minify: true,
      sourcemap: false
    }
  }
});
