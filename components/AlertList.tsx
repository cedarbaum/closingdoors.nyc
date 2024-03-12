import { useState } from "react";
import { Alert, AlertProps } from "./Alert";
import {
  XMarkIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import AnimateHeight from "react-animate-height";

export enum Behavior {
  Collapsable,
  Closable,
  None,
}

export interface AlertListProps {
  alerts: AlertProps[];
  behavior: Behavior;
  title?: string;
  hideAlertIcon?: boolean;
  onClose?(): void;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  behavior,
  title,
  hideAlertIcon,
  onClose,
}) => {
  const [expanded, setExpanded] = useState<boolean>(
    behavior !== Behavior.Collapsable
  );

  const numAlerts = alerts.length;
  if (numAlerts === 0) {
    return null;
  }

  function onIconClick() {
    switch (behavior) {
      case Behavior.Closable: {
        onClose && onClose();
        break;
      }
      case Behavior.Collapsable: {
        setExpanded(!expanded);
        break;
      }
    }
  }

  const headerRightIcon = (() => {
    switch (behavior) {
      case Behavior.Closable: {
        return (
          <XMarkIcon
            onClick={onIconClick}
            className="h-6 w-6 stroke-[4px] cursor-pointer"
          />
        );
      }
      case Behavior.Collapsable: {
        return (
          <ChevronDownIcon
            onClick={onIconClick}
            className={`h-6 w-6 stroke-[2px] cursor-pointer transform ${
              expanded ? "rotate-180" : "rotate-0"
            }`}
          />
        );
      }
      default: {
        return null;
      }
    }
  })();

  const alertTitle = title || `${numAlerts} service ${numAlerts > 1 ? "alerts" : "alert"}`;
  return (
    <div className="justify-between items-center bg-mtaYellow text-black">
      <div
        className={`flex justify-between items-center p-4 ${
          behavior === Behavior.Collapsable ? "cursor-pointer" : ""
        }`}
        onClick={() =>
          behavior === Behavior.Collapsable && setExpanded(!expanded)
        }
      >
        <div className="flex items-center">
          {!hideAlertIcon && (
            <ExclamationTriangleIcon className="mr-2 inline-block h-6 w-6 stroke-[2px]" />
          )}
          <h1 className="inline-block font-bold">
            {alertTitle}
          </h1>
        </div>
        {headerRightIcon}
      </div>
      <AnimateHeight
        duration={250}
        height={expanded ? "auto" : 0}
        animateOpacity={false}
      >
        <div className="mt-4">
          {alerts.map((alert, idx) => {
            return (
              <div
                key={`alert${idx}`}
                className="p-4 first-of-type:pt-0 border-dotted not-last:border-b-2 border-black"
              >
                <Alert {...alert} />
              </div>
            );
          })}
        </div>
      </AnimateHeight>
    </div>
  );
};
