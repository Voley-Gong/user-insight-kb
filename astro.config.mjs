// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://user-insight-kb.github.io',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
});
