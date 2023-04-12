import { AnimatePresence, motion } from "framer-motion";
import { createContext, useEffect, useState } from "react";
import Head from "next/head";

export const PopoverAlertContext = createContext(
  (_alert: React.ReactNode) => {}
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (!alert) return;

    const timeout = setTimeout(() => {
      setAlert(null);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [alert]);

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
      <PopoverAlertContext.Provider value={setAlert}>
        <div className="bg-black h-full w-full">
          <AnimatePresence>
            {alert && (
              <div className="absolute top-0 z-[999] w-full">
                <motion.div
                  initial={{ y: "-100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ spring: 0, duration: 0.1, ease: "easeOut" }}
                >
                  <div className="relative h-max w-full bg-mtaYellow p-4 text-xl font-bold">
                    {alert}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          <main className="bg-black max-w-md mx-auto">{children}</main>
        </div>
      </PopoverAlertContext.Provider>
    </>
  );
}
