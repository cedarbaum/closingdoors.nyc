import NycSubwayRoutePicker from "@/components/NycSubwayRoutePicker";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Closing Doors</title>
        <meta name="description" content="Minimalist NYC subway schedule" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚇</text></svg>"
        />
        <meta name="theme-color" content="#000000" />
      </Head>
      <NycSubwayRoutePicker />
    </>
  );
}
