import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="shortcut icon"
          href="/icons/favicon-light.ico"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="shortcut icon"
          href="/icons/favicon-dark.ico"
          media="(prefers-color-scheme: dark)"
        />
        <link rel="shortcut icon" href="/icons/favicon-light.ico" />
        <meta name="theme-color" content="#000000" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png"></link>
        <meta name="theme-color" content="#000000" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
