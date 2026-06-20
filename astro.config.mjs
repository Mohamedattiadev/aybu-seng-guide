import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// For GitHub Pages: uncomment and set `site` to your published URL.
// If deploying to https://<user>.github.io/<repo>/ set base: '/<repo>/'.
// Example:
//   site: 'https://mohamedattiaDev.github.io',
//   base: '/aybu-seng-guide',
export default defineConfig({
  // site: 'https://example.github.io',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [tailwind({ applyBaseStyles: false })],
});
