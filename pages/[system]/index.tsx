import CitiBikeView from "@/components/CitiBikeView";
import { FullScreenError } from "@/components/FullScreenError";
import NycSubwayRoutePicker from "@/components/NycSubwayRoutePicker";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSettings } from "../settings";
import { getSystemEnabled } from "@/utils/features";

export default function System() {
  const router = useRouter();
  const system = router.query.system as string;
  const settings = useSettings();

  if (!router.isReady || !settings?.settingsReady) {
    return null;
  }

  if (system === "us-ny-nyccitibike") {
    if (!getSystemEnabled("us-ny-nyccitibike")) {
      return (
        <FullScreenError
          error={
            <div>
              CitiBike is not available. Click{" "}
              <Link className="underline" href="/">
                here
              </Link>{" "}
              to go back home.
            </div>
          }
        />
      );
    }

    if (!settings.citiBikeEnabled) {
      return (
        <FullScreenError
          error={
            <div>
              CitiBike is not enabled. Enable it in{" "}
              <Link className="underline" href="/settings">
                settings
              </Link>{" "}
              to view this page.
            </div>
          }
        />
      );
    }

    return <CitiBikeView />;
  }

  if (system === "us-ny-subway") {
    return <NycSubwayRoutePicker />;
  }

  return (
    <FullScreenError
      error={
        <div>
          Invalid transportation system. Click{" "}
          <Link className="underline" href="/">
            here
          </Link>{" "}
          to go back home.
        </div>
      }
    />
  );
}
