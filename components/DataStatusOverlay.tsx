import React from "react";
import { SignalIcon, SignalSlashIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import useNetworkStatus from "@/utils/useNetworkStatus";

const DATA_STALE_THRESHOLD_SECONDS = 60;

export interface DataStatusOverlayProps {
  lastUpdate?: number;
}

export const DataStatusOverlay: React.FC<DataStatusOverlayProps> = ({
  lastUpdate,
}) => {
  const { isOnline } = useNetworkStatus();
  const timeSinceLastUpdateSeconds = lastUpdate
    ? Math.floor((Date.now() - lastUpdate) / 1000)
    : null;
  const dataIsStale =
    timeSinceLastUpdateSeconds &&
    timeSinceLastUpdateSeconds > DATA_STALE_THRESHOLD_SECONDS;

  return (
    <AnimatePresence>
      {dataIsStale && (
        <motion.div
          className="fixed z-[100] bottom-4 p-4 w-full flex flex-row items-center justify-center pointer-events-none"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="flex p-4 flex-row bg-mtaYellow">
            {isOnline ? (
              <SignalIcon className="h-6 w-6 mr-2" />
            ) : (
              <SignalSlashIcon className="h-6 w-6 mr-2" />
            )}
            <span className="font-bold">Data is stale</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};