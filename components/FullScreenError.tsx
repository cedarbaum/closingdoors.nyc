import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Notice, useServiceStatus } from "@/utils/ServiceStatus";
import { System } from "@/utils/System";

export interface FullScreenErrorProps {
  error: React.ReactNode;
  errorDetails?: React.ReactNode;
  system?: System
}

export const FullScreenError: React.FC<FullScreenErrorProps> = (props) => {
  const { data } = useServiceStatus();
  const noticeforsystem = data?.find((n) =>
    n.affected_systems.find((s) => s === props.system),
  );

  return (
    <div className="w-full h-full bg-mtaYellow scrollbar-hide overflow-scroll box-border">
      <div className="font-bold text-4xl p-4">
        <ExclamationTriangleIcon className="w-[75px] h-[75px] mb-4 ml-[-5px]" />
        <p>{props.error}</p>
      </div>
      {noticeforsystem && (
        <div className="p-4">
          <ServiceStatus notice={noticeforsystem} />
        </div>
      )}
      {props.errorDetails && (
        <div className="text-lg mt-4">{props.errorDetails}</div>
      )}
    </div>
  );
};

function ServiceStatus({ notice }: { notice: Notice }) {
  return (
    <div className="px-4 py-2 w-full border border-black flex flex-col">
      <div className="font-bold text-lg">{notice.title}</div>
      <div className="text-md">{notice.message}</div>
    </div>
  );
}
