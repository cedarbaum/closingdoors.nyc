import { getNycDateTimeStringFromSeconds } from "@/utils/DateTimeUtils";
import { processMtaText } from "@/utils/TextProcessing";
import { useEffect, useState } from "react";

export interface MtaAlertProps {
  header?: string | null;
  description?: string | null;
  humanReadableActivePeriod?: string | null;
  startsAt?: number | null;
  endsAt?: number | null;
}

const routesToShowBorderFor = new Set(
  ["N", "Q", "R", "W"].map((r) => r.toLowerCase())
);

export const MtaAlert: React.FC<MtaAlertProps> = ({
  header,
  description,
  humanReadableActivePeriod,
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
  if (humanReadableActivePeriod) {
    currentActivePeriod = (
      <span className="text-sm text-slate-800">
        Active period:{" "}
        <span className="text-black font-bold">
          {humanReadableActivePeriod}
        </span>
      </span>
    );
  } else if (startsAt && endsAt) {
    currentActivePeriod = (
      <span className="text-sm text-slate-800">
        Active period from{" "}
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
        Active period from{" "}
        <span className="text-black font-bold">
          {getNycDateTimeStringFromSeconds(startsAt)}
        </span>
      </span>
    );
  }

  return (
    <div className="alert-container">
      {currentActivePeriod && (
        <div className="mb-2 p-2 border border-black">
          {currentActivePeriod}
        </div>
      )}
      {header && <div dangerouslySetInnerHTML={{ __html: headerHtml }} />}
      {description && (
        <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
      )}
    </div>
  );
};
