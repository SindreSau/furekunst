/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                pastel: {
                    light: '#f4fcff',
                    DEFAULT: '#FFF',
                    dark: '#F8F8F8',
                },
                primary: '#9D9D9D',
                secondary: '#393939',
            },
            fontFamily: {
                sans: ['Open Sans', 'sans-serif'],
                kanit: ['Kanit', 'sans-serif'],
                didot: ['Didot', 'serif'],
            },
        },
    },
    plugins: [],
};
