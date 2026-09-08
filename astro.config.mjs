// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Production domain — update before going live.
  site: 'https://urbosuites.in',

  // Hybrid mode: static pages prerendered to CDN,
  // API routes and Astro Actions run as Vercel serverless functions.
  output: 'static',

  adapter: vercel({
    webAnalytics: { enabled: true },
  }),

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    // React integration for interactive booking islands.
    // Islands use client:visible / client:idle directives — never SSR'd.
    react(),
    // Auto-generates sitemap.xml at build time from all routes.
    sitemap(),
  ],

  // Image optimization config — WebP preferred, lazy by default.
  image: {
    // Domains from which remote images may be optimized.
    domains: ['images.unsplash.com', 'picsum.photos'],
    remotePatterns: [{ protocol: 'https' }],
  },
});