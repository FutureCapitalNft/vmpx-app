import { Italiana, Gentium_Plus  } from 'next/font/google';

const interFont = Italiana({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-serif',
  weight: "400"
});

export const interFontClass = interFont.variable;

const gentumFont = Gentium_Plus({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-serif',
  weight: "400"
});

export const gentumFontClass = gentumFont.variable;
