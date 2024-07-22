import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwind from '@astrojs/tailwind';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: netlify(),
    integrations: [tailwind(), icon()],
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@import "src/styles/global.css";`,
                },
            },
        },
    },
});
