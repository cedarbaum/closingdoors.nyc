import React from "react";
import * as S from "./Alert.styles";
import { renderToString } from "react-dom/server";

import { SubwayIcon, routeIdToImage } from "../SubwayIcon/SubwayIcon";
import DOMPurify from "dompurify";

export interface AlertProps {
  header?: string | null;
  description?: string | null;
  showBottomBorder?: boolean;
  paddingBottom?: string | number;
}

const routesToShowBorderFor = new Set(["N", "Q", "R", "W"]);

export const Alert: React.FC<AlertProps> = (props) => {
  return (
    <S.Container
      showBottomBorder={props.showBottomBorder}
      paddingBottom={props.paddingBottom}
    >
      {props.header && (
        <S.AlertHeader
          dangerouslySetInnerHTML={{ __html: processAlertText(props.header) }}
        />
      )}
      {props.description && (
        <S.AlertBody
          dangerouslySetInnerHTML={{
            __html: processAlertText(props.description),
          }}
        />
      )}
    </S.Container>
  );
};

function processAlertText(alertText?: string) {
  if (!alertText) {
    return "";
  }

  const innerHtml = alertText.replaceAll(/\[.*?\]/g, (match: string) => {
    const innerText = match.substring(1, match.length - 1);
    if (routeIdToImage.has(innerText)) {
      return renderToString(
        <SubwayIcon
          name={innerText}
          sizeEm={1.2}
          border={routesToShowBorderFor.has(innerText) ? "1px solid black" : undefined}
        />
      );
    }

    return match;
  });

  return DOMPurify.sanitize(innerHtml);
}
