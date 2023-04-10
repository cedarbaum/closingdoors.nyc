import dynamic from "next/dynamic";

const NycSubwayScheduleViewer = dynamic(
  () => import("@/components/NycSubwayScheduleView"),
  {
    ssr: false,
  }
);

const Schedule: React.FC = () => {
  return <NycSubwayScheduleViewer />;
};

export default Schedule;
