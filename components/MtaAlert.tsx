import { getNycDateTimeStringFromSeconds } from "@/utils/DateTimeUtils";
import { processMtaText } from "@/utils/TextProcessing";
import { useEffect, useState } from "react";

export interface MtaAlertProps {
  header?: string | null;
  description?: string | null;
  startsAt?: number | null;
  endsAt?: number | null;
}

const routesToShowBorderFor = new Set(
  ["N", "Q", "R", "W"].map((r) => r.toLowerCase())
);

export const MtaAlert: React.FC<MtaAlertProps> = ({
  header,
  description,
  startsAt,
  endsAt,
}) => {
  const [headerHtml, setHeaderHtml] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      if (header) {
        setHeaderHtml(processMtaText(header, routesToShowBorderFor));
      }

      if (description) {
        setDescriptionHtml(processMtaText(description, routesToShowBorderFor));
      }
    });
  }, [header, description]);

  let currentActivePeriod = null;
  if (startsAt && endsAt) {
    currentActivePeriod = (
      <span className="text-sm text-slate-800">
        Current active period from{" "}
        <span className="text-black font-bold">
          {getNycDateTimeStringFromSeconds(startsAt)}
        </span>{" "}
        to{" "}
        <span className="text-black font-bold">
          {getNycDateTimeStringFromSeconds(endsAt)}
        </span>
      </span>
    );
  } else if (startsAt) {
    currentActivePeriod = (
      <span className="text-sm text-slate-800">
        Current active period from{" "}
        <span className="text-black font-bold">
          {getNycDateTimeStringFromSeconds(startsAt)}
        </span>
      </span>
    );
  }

  return (
    <div className="alert-container">
      {header && <div dangerouslySetInnerHTML={{ __html: headerHtml }} />}
      {description && (
        <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
      )}
      {currentActivePeriod && <div className="mt-2">{currentActivePeriod}</div>}
    </div>
  );
};
