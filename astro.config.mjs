import { defineConfig } from 'astro/config';

export default defineConfig({
  // Astro-first configuration for PersonalOps
  // Produces static output for GitHub Pages deployment at /personalops/
  output: 'static',

  // GitHub Pages deploys to /personalops/ subdirectory
  // Astro uses this to rewrite asset paths correctly
  base: '/personalops/',

  // Build output directory
  outDir: './dist',

  // Public assets directory
  publicDir: './public',

  // Integrations (minimal, offline-first focus)
  integrations: [],

  // Build-time optimizations
  vite: {
    build: {
      minify: true,
      sourcemap: false
    }
  }
});
