import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export interface FullScreenErrorProps {
  error: React.ReactNode;
  errorDetails?: React.ReactNode;
}

export const FullScreenError: React.FC<FullScreenErrorProps> = (props) => {
  return (
    <div className="w-full h-full bg-mtaYellow scrollbar-hide overflow-scroll box-border">
      <div className="font-bold text-4xl p-4">
        <ExclamationTriangleIcon className="w-[75px] h-[75px] mb-4 ml-[-5px]" />
        <p>{props.error}</p>
      </div>
      {props.errorDetails && (
        <div className="text-lg mt-4">{props.errorDetails}</div>
      )}
    </div>
  );
};
