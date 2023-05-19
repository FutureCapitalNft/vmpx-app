import Document, {
  Head, Html, Main, NextScript
} from 'next/document';
import Script from 'next/script'

// Need to create a custom _document because i18n support is not compatible with `next export`.
class MyDocument extends Document {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <Html lang="en-US">
        <Head>
          {<link rel="shortcut icon" href="/favicon.ico"/>
            /*<link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="assets/img/logo-180x180-black.png" />
          <link rel="apple-touch-icon" href="assets/img/logo-192x192-black.png" />
          <link rel="apple-touch-icon" href="assets/img/logo-256x256-black.png" />*/}
          <meta name="theme-color" content="#000"/>
          {/*<link
            href="https://fonts.googleapis.com/css2?family=Oswald&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Old+Standard+TT&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro&display=swap"
            rel="stylesheet"
          />*/}

          {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
              strategy="afterInteractive"
          />}
          {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && <Script
              id="google-analytics"
              strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
          `}
          </Script>}
        </Head>
        <body>
        <Main />
        <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

