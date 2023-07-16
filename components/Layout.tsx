import { AnimatePresence, motion } from "framer-motion";
import { createContext, useEffect, useState } from "react";
import Head from "next/head";
import { PageSelectorHeader, Tab } from "./PageSelectorHeader";
import { useRouter } from "next/router";

import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export interface PopoverAlert {
  type: "info" | "error";
  content: React.ReactNode;
}

export const PopoverAlertContext = createContext((_alert: PopoverAlert) => {});

const tabs: Tab[] = [
  {
    name: "subway",
    content: "subway",
    widthPercent: 35,
  },
  {
    name: "path",
    content: "path",
    widthPercent: 35,
  },
  {
    name: "chat",
    content: (
      <div className="w-6 h-6">
        <ChatBubbleLeftEllipsisIcon />
      </div>
    ),
    widthPercent: 15,
  },
  {
    name: "settings",
    content: (
      <div className="w-6 h-6">
        <Cog6ToothIcon />
      </div>
    ),
    widthPercent: 15,
  },
];

const pathToTabName = new Map([
  ["/us-ny-subway", "subway"],
  ["/us-ny-path/schedule", "path"],
  ["/chat", "chat"],
  ["/settings", "settings"],
]);

const tabNameToPath = new Map(
  Array.from(pathToTabName.entries()).map(([key, value]) => [value, key])
);

const pathsToShowTabbarFor = new Set(pathToTabName.keys());

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [alert, setAlert] = useState<PopoverAlert | null>(null);

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
        <meta
          name="description"
          content="Minimalist NYC subway and PATH schedule viewer"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="/favicon-light.ico"
          media="(prefers-color-scheme: no-preference)"
        />
        <link
          rel="icon"
          href="/favicon-light.ico"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/favicon-dark.ico"
          media="(prefers-color-scheme: dark)"
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
                  <div
                    className={`relative h-max w-full p-4 text-xl ${
                      alert.type === "error"
                        ? "bg-mtaYellow text-black"
                        : "bg-mtaBlue text-white"
                    }`}
                  >
                    {alert.content}
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
