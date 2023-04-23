import { NycSubwayIcon } from "./NycSubwayIcon";
import { convertReactComponentToHtml } from "@/utils/ReactUtils";
import { allRoutesIds } from "@/utils/SubwayLines";
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
        setHeaderHtml(processAlertText(header));
      }

      if (description) {
        setDescriptionHtml(processAlertText(description));
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

function processAlertText(alertText?: string) {
  if (!alertText) {
    return "";
  }

  const innerHtml = alertText.replaceAll(/\[.*?\]/g, (match: string) => {
    const innerText = match.substring(1, match.length - 1).toLowerCase();
    if (allRoutesIds.has(innerText) || additionalRouteIcons.has(innerText)) {
      return convertReactComponentToHtml(
        <span className="relative align-text-bottom inline-block w-[1.25em] h-[1.25em]">
          <NycSubwayIcon
            route={innerText}
            width={"1.25em"}
            height={"1.25em"}
            border={
              routesToShowBorderFor.has(innerText)
                ? "1px solid black"
                : undefined
            }
          />
        </span>
      );
    }

    if (innerText === "accessibility icon") {
      return convertReactComponentToHtml(
        <span className="relative align-text-bottom inline-block w-[1.25em] h-[1.25em]">
          <Image
            src="/mta-alert-icons/International_Symbol_of_Access.svg"
            alt="Accessibility icon"
            fill
          />
        </span>
      );
    }

    if (innerText === "shuttle bus icon") {
      return convertReactComponentToHtml(
        <span className="relative align-text-bottom inline-block w-[1.25em] h-[1.25em]">
          <Image src="/mta-alert-icons/bus.svg" alt="Shuttle bus icon" fill />
        </span>
      );
    }

    return match;
  });

  return DOMPurify.sanitize(innerHtml);
}
