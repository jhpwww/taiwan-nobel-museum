// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * GitHub Pages project site. When a custom domain is added later, set
 * SITE_URL and drop BASE_PATH to '/' — nothing else needs to change,
 * because every internal link goes through src/i18n/routing.ts.
 */
const SITE = process.env.SITE_URL ?? 'https://jhpwww.github.io';
const BASE = process.env.BASE_PATH ?? '/taiwan-nobel-museum';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  build: { inlineStylesheets: 'auto' },
  compressHTML: true,
});
