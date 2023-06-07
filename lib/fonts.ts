import { Gentium_Plus  } from 'next/font/google';
import localFont from 'next/font/local';


const italianaFont = localFont({
  display: 'swap',
  // subsets: ['latin'],
  variable: '--font-serif',
  src: "./fonts/Italiana/Italiana-Regular.ttf",
  weight: "400"
});

export const italianaFontClass = italianaFont.variable;

const gentumFont = Gentium_Plus({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-serif',
  weight: "400"
});

export const gentumFontClass = gentumFont.variable;
