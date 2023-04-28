import { NycSubwayIcon } from "./NycSubwayIcon";
import { convertReactComponentToHtml } from "@/utils/ReactUtils";
import { allRoutesIds } from "@/utils/SubwayLines";
import { processMtaText } from "@/utils/TextProcessing";
import DOMPurify from "dompurify";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface MtaAlertProps {
  header?: string | null;
  description?: string | null;
  showBottomBorder?: boolean;
  paddingBottom?: string | number;
  addLeftRightPadding?: boolean;
}

const routesToShowBorderFor = new Set(
  ["N", "Q", "R", "W"].map((r) => r.toLowerCase())
);

const additionalRouteIcons = new Set(["S"].map((r) => r.toLowerCase()));

export const MtaAlert: React.FC<MtaAlertProps> = ({ header, description }) => {
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

  return (
    <div className="alert-container">
      {header && <div dangerouslySetInnerHTML={{ __html: headerHtml }} />}
      {description && (
        <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
      )}
    </div>
  );
};
