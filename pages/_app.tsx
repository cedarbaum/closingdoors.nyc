import Layout from "@/components/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";

import { Client, Provider, cacheExchange, fetchExchange } from "urql";

const client = new Client({
  url: "/api/graphql",
  exchanges: [cacheExchange, fetchExchange],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Provider value={client}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
      <Analytics />
    </>
  );
}
