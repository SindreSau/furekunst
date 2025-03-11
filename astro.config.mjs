import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import icon from 'astro-icon';

import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: vercel({
        isr: true,
        webAnalytics: {
            enabled: true,
        },
    }),

    image: {
        remotePatterns: [{ protocol: 'https', hostname: 'images.ctfassets.net' }],
    },

    integrations: [tailwind(), icon(), sitemap()],

    site: 'https://furekunst.no',
});
