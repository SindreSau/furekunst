/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                pastel: {
                    light: '#f4fcff',
                    DEFAULT: '#FFF',
                    dark: '#c8f1ff',
                },
                primary: {
                    light: '#454545',
                    DEFAULT: '#393939',
                    dark: '##121212',
                },
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
