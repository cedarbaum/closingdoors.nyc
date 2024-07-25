import { useEffect, useState } from "react";

export default function usePageRefresh(refetchIntervalMs = 1000) {
  const [, setTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), refetchIntervalMs);
    return () => {
      clearInterval(interval);
    };
  }, [refetchIntervalMs]);
}
