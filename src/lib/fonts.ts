// src/lib/fonts.ts
import localFont from 'next/font/local'

// Load Didot font family
export const didot = localFont({
  src: [
    {
      path: '../assets/fonts/Didot Font Family/Didot.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Didot Font Family/Didot Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../assets/fonts/Didot Font Family/Didot Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Didot Font Family/Didot Title.otf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-didot',
  display: 'swap',
})
