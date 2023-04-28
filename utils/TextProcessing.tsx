import { NycSubwayIcon } from "@/components/NycSubwayIcon";
import { convertReactComponentToHtml } from "./ReactUtils";
import Image from "next/image";
import DOMPurify from "dompurify";
import { allRoutesIds } from "./SubwayLines";

const additionalRouteIcons = new Set(["S", "SI"].map((r) => r.toLowerCase()));

export function processMtaText(
  text?: string,
  routesToShowBorderFor?: Set<string>
) {
  if (!text) {
    return "";
  }

  const innerHtml = text.replaceAll(/\[.*?\]/g, (match: string) => {
    const innerText = match.substring(1, match.length - 1).toLowerCase();
    if (allRoutesIds.has(innerText) || additionalRouteIcons.has(innerText)) {
      return convertReactComponentToHtml(
        <span className="relative align-text-bottom inline-block w-[1.25em] h-[1.25em]">
          <NycSubwayIcon
            route={innerText}
            width={"1.25em"}
            height={"1.25em"}
            border={
              routesToShowBorderFor?.has(innerText)
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
