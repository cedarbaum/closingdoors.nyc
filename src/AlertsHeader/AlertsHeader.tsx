import React, { useState } from "react";
import {
  faChevronDown,
  faExclamationTriangle,
  faWindowClose,
} from "@fortawesome/pro-solid-svg-icons";
import * as S from "./AlertsHeader.style";
import AnimateHeight from "react-animate-height";
import { Alert, AlertProps } from "../Alert/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export enum Behavior {
  Collapsable,
  Closable,
  None,
}

export interface AlertsHeaderProps {
  alerts: AlertProps[];
  behavior: Behavior;
  onClose?(): void;
}

export const AlertsHeader: React.FC<AlertsHeaderProps> = (props) => {
  const [expanded, setExpanded] = useState<boolean>(
    props.behavior !== Behavior.Collapsable
  );

  const numAlerts = props.alerts.length;
  if (numAlerts === 0) {
    return null;
  }

  function onIconClick() {
    switch (props.behavior) {
      case Behavior.Closable: {
        props.onClose && props.onClose();
        break;
      }
      case Behavior.Collapsable: {
        setExpanded(!expanded);
        break;
      }
      case Behavior.None:
      default: {
      }
    }
  }

  return (
    <S.Container>
      <S.DropDownHeader
        onClick={() =>
          props.behavior === Behavior.Collapsable && setExpanded(!expanded)
        }
      >
        <S.NumberOfAlertsSpan>
          <FontAwesomeIcon icon={faExclamationTriangle} /> {numAlerts} active{" "}
          {numAlerts > 1 ? "alerts" : "alert"}
        </S.NumberOfAlertsSpan>
        <S.RotatableIcon
          angledeg={expanded ? 180 : 0}
          icon={
            props.behavior === Behavior.Collapsable
              ? faChevronDown
              : faWindowClose
          }
          color={"black"}
          onClick={onIconClick}
        />
      </S.DropDownHeader>
      <AnimateHeight
        duration={250}
        height={expanded ? "auto" : 0}
        animateOpacity={false}
      >
        <S.DropDownBody>
          {props.alerts.map((alert, idx) => {
            return (
              <Alert
                key={`alert${idx}`}
                {...alert}
                showBottomBorder={idx < props.alerts.length - 1}
                paddingBottom={
                  idx < props.alerts.length - 1 ? undefined : "1em"
                }
              />
            );
          })}
        </S.DropDownBody>
      </AnimateHeight>
    </S.Container>
  );
};
