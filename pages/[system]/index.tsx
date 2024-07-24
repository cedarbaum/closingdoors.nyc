import CitiBikeView from "@/components/CitiBikeView";
import { FullScreenError } from "@/components/FullScreenError";
import NycSubwayRoutePicker from "@/components/NycSubwayRoutePicker";
import Link from "next/link";
import { useRouter } from "next/router";

export default function System() {
  const router = useRouter();
  const system = router.query.system as string;

  if (!router.isReady) {
    return null;
  }

  if (system === "us-ny-nyccitibike") {
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
