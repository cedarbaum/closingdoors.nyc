import { FullScreenError } from "@/components/FullScreenError";
import NycBusScheduleView from "@/components/NycBusScheduleView";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";

const NycSubwayScheduleViewer = dynamic(
  () => import("@/components/NycSubwayScheduleView"),
  {
    ssr: false,
  }
);

const PathScheduleView = dynamic(
  () => import("@/components/PathScheduleView"),
  {
    ssr: false,
  }
);

const Schedule: React.FC = () => {
  const router = useRouter();
  const system = router.query.system as string;

  if (!router.isReady) {
    return null;
  }

  if (system === "us-ny-subway") {
    return <NycSubwayScheduleViewer />;
  } else if (system === "us-ny-nycbus") {
    return <NycBusScheduleView />;
  } else if (system === "us-ny-path") {
    return <PathScheduleView />;
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
};

export default Schedule;
