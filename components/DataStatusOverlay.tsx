import React from "react";
import { SignalSlashIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import useNetworkStatus from "@/utils/useNetworkStatus";
import usePageRefresh from "@/utils/usePageRefresh";

const DATA_STALE_THRESHOLD_SECONDS = 60;

export interface DataStatusOverlayProps {
  lastUpdate?: number;
}

export const DataStatusOverlay: React.FC<DataStatusOverlayProps> = ({
  lastUpdate,
}) => {
  const { isOnline } = useNetworkStatus();

  // Periodically refresh page to see if data is stale
  usePageRefresh(3000);

  const timeSinceLastUpdateSeconds = lastUpdate
    ? Math.floor((Date.now() - lastUpdate) / 1000)
    : null;
  const dataIsStale =
    timeSinceLastUpdateSeconds &&
    timeSinceLastUpdateSeconds > DATA_STALE_THRESHOLD_SECONDS;

  const message = !isOnline ? "No connection" : "Updating data";

  return (
    <AnimatePresence>
      {dataIsStale && (
        <motion.div
          className="fixed z-[100] bottom-4 left-0 p-4 w-full flex flex-row items-center justify-center pointer-events-none"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="flex p-4 flex-row bg-mtaYellow">
            {isOnline ? (
              <ArrowPathIcon className="h-6 w-6 mr-2 animate-spin" />
            ) : (
              <SignalSlashIcon className="h-6 w-6 mr-2" />
            )}
            <span className="font-bold">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
