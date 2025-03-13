/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1152px', // Changed from 1280px to 1152px (72rem)
            },
        },
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
