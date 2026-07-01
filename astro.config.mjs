// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://voley-gong.github.io',
  base: '/user-insight-kb',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
});
