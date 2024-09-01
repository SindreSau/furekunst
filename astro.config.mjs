import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwind from '@astrojs/tailwind';

import icon from 'astro-icon';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: netlify(),
    image: {
        remotePatterns: [{ protocol: 'https', hostname: 'images.ctfassets.net' }],
    },
    integrations: [tailwind(), icon(), sitemap()],
    site: 'https://furekunst.no',
});
