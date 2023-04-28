import { AnimatePresence, motion } from "framer-motion";
import { createContext, useEffect, useState } from "react";
import Head from "next/head";
import { PageSelectorHeader, Tab } from "./PageSelectorHeader";
import { useRouter } from "next/router";

import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";

export const PopoverAlertContext = createContext(
  (_alert: React.ReactNode) => {}
);

const tabs: Tab[] = [
  {
    name: "subway",
    content: "subway",
    widthPercent: 40,
  },
  {
    name: "path",
    content: "path",
    widthPercent: 40,
  },
  {
    name: "chat",
    content: (
      <div className="w-6 h-6">
        <ChatBubbleLeftEllipsisIcon />
      </div>
    ),
    widthPercent: 20,
  },
];

const pathToTabName = new Map([
  ["/us-ny-subway", "subway"],
  ["/us-ny-path/schedule", "path"],
  ["/chat", "chat"],
]);

const tabNameToPath = new Map(
  Array.from(pathToTabName.entries()).map(([key, value]) => [value, key])
);

const pathsToShowTabbarFor = new Set(pathToTabName.keys());

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [alert, setAlert] = useState<React.ReactNode | null>(null);

  const system = router.query.system as string;
  const path = router.pathname as string;
  const pathWithSystem = path.replace("[system]", system);

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
          <div className="flex flex-col bg-black max-w-md mx-auto w-full h-full">
            {pathsToShowTabbarFor.has(pathWithSystem) && (
              <PageSelectorHeader
                tabs={tabs}
                activeTab={pathToTabName.get(pathWithSystem)!}
                onTabClick={(tab) => {
                  router.push(tabNameToPath.get(tab)!);
                }}
              />
            )}
            <main className="w-full overflow-auto scrollbar-hide">
              {children}
            </main>
          </div>
        </div>
      </PopoverAlertContext.Provider>
    </>
  );
}
