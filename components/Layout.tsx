import { AnimatePresence, motion } from "framer-motion";
import { createContext, useEffect, useState } from "react";
import { PageSelectorHeader, Tab } from "./PageSelectorHeader";
import { useRouter } from "next/router";

import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getChatEnabled, getSystemEnabled } from "@/utils/features";

export interface PopoverAlert {
  type: "info" | "error";
  content: React.ReactNode;
}

export const PopoverAlertContext = createContext((_alert: PopoverAlert) => {});

type Feature = {
  type: "chat" | "settings" | "system";
  name: string;
  content: React.ReactNode;
  enabled: () => boolean;
};

const features: Feature[] = [
  {
    name: "subway",
    content: "subway",
    type: "system",
    enabled: () => getSystemEnabled("us-ny-subway"),
  },
  {
    name: "bus",
    content: "bus",
    type: "system",
    enabled: () => getSystemEnabled("us-ny-nycbus"),
  },
  {
    name: "path",
    content: "path",
    type: "system",
    enabled: () => getSystemEnabled("us-ny-path"),
  },
  {
    name: "chat",
    content: (
      <div className="w-6 h-6">
        <ChatBubbleLeftEllipsisIcon />
      </div>
    ),
    type: "chat",
    enabled: () => getChatEnabled(),
  },
  {
    name: "settings",
    content: (
      <div className="w-6 h-6">
        <Cog6ToothIcon />
      </div>
    ),
    type: "settings",
    enabled: () => true,
  },
];

function getTabsFromFeatures(features: Feature[]) {
  const chatEnabled = getChatEnabled();
  const otherTabWidthPercent = 12.5;
  const allOtherTabsWidthPercent = otherTabWidthPercent +
    (chatEnabled ? otherTabWidthPercent : 0);

  const allSystemsWidthPercent = 100 - allOtherTabsWidthPercent;
  const numEnabledSystems =
    features.filter((f) => f.type === "system" && f.enabled()).length;

  let tabs: Tab[] = [];
  for (const feature of features) {
    if (!feature.enabled()) continue;
    if (feature.type === "system") {
      tabs.push({
        name: feature.name,
        content: feature.content,
        widthPercent: allSystemsWidthPercent / numEnabledSystems,
      });
    } else {
      tabs.push({
        name: feature.name,
        content: feature.content,
        widthPercent: otherTabWidthPercent,
      });
    }
  }

  return tabs;
}

const pathToTabName = new Map([
  ["/us-ny-subway", "subway"],
  ["/us-ny-subway/schedule", "subway"],
  ["/us-ny-nycbus/schedule", "bus"],
  ["/us-ny-path/schedule", "path"],
  ["/chat", "chat"],
  ["/settings", "settings"],
]);

const tabOnClickRoutes = new Map([
  ["/us-ny-subway", "subway"],
  ["/us-ny-nycbus/schedule", "bus"],
  ["/us-ny-path/schedule", "path"],
  ["/chat", "chat"],
  ["/settings", "settings"],
]);

const tabNameToPath = new Map(
  Array.from(tabOnClickRoutes.entries()).map(([key, value]) => [value, key]),
);

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
            <PageSelectorHeader
              tabs={getTabsFromFeatures(features)}
              activeTab={pathToTabName.get(pathWithSystem)!}
              onTabClick={(tab) => {
                router.push(tabNameToPath.get(tab)!);
              }}
            />
            {pathWithSystem === "/us-ny-subway/schedule" && (
              <Link
                href="/us-ny-subway"
                className="block bg-black text-white px-2 py-3 cursor-pointer"
              >
                ← Back to route picker
              </Link>
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
