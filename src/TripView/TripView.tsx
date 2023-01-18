import React from "react";
import { SubwayIcon } from "../SubwayIcon/SubwayIcon";
import { allRoutes, DIRECTION } from "../utils/SubwayLines";
import * as S from "./TripView.styles";

import { faArrowUp, faArrowDown } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Duration } from "luxon";
import humanizeDuration from "humanize-duration";

export enum DURATION_FORMAT {
  MinuteCeiling,
  Exact,
}

export interface TripViewProps {
  route: string;
  direction: DIRECTION;
  timeUntilArrival: Duration;
  durationFormat?: DURATION_FORMAT;
  onClickTimeText?(): void;
}

export const TripView: React.FC<TripViewProps> = (props) => {
  const isDiamond = props.route.endsWith("X");
  const route = allRoutes.find(
    (route) =>
      route.name === props.route &&
      (route.isDiamond === isDiamond ||
        (!isDiamond && route.isDiamond === undefined))
  );
  const normalizedRouteName = isDiamond
    ? props.route.substring(0, props.route.length - 1)
    : props.route;

  const durationAbsValue =
    props.timeUntilArrival.toMillis() < 0
      ? props.timeUntilArrival.negate()
      : props.timeUntilArrival;
  const displayArrivingNow =
    props.timeUntilArrival.toMillis() < 15 * 1000 &&
    props.durationFormat === DURATION_FORMAT.MinuteCeiling;
  const lessThanAMin = durationAbsValue.toMillis() < 60 * 1000;
  const staleTrip =
    props.timeUntilArrival.toMillis() < -1 * 30 * 1000 ||
    (props.durationFormat === DURATION_FORMAT.Exact &&
      props.timeUntilArrival.toMillis() < 0);
  const shortEnglishHumanizer = humanizeDuration.humanizer({
    language: "shortEn",
    languages: {
      shortEn: {
        h: (units: any) => (units && units > 1 ? "hrs" : "hr"),
        m: (units: any) => (units && units > 1 ? "mins" : "min"),
        s: (units: any) => (units && units > 1 ? "secs" : "sec"),
      },
    },
  });

  let durationStr: string;
  if (props.durationFormat === DURATION_FORMAT.Exact) {
    const formatStr =
      durationAbsValue.milliseconds >= 3600 * 1000 ? "h:mm:ss" : "m:ss";
    durationStr = durationAbsValue.toFormat(formatStr);
  } else {
    if (lessThanAMin) {
      durationStr = shortEnglishHumanizer(durationAbsValue.milliseconds, {
        units: ["m", "s"],
        round: true,
      });
    } else {
      const ceilingMinutesMilliseconds =
        Math.ceil(durationAbsValue.milliseconds / (60 * 1000)) * (60 * 1000);
      durationStr = shortEnglishHumanizer(ceilingMinutesMilliseconds, {
        units: ["h", "m"],
        round: true,
      });
    }
  }

  return (
    <S.Container>
      <S.LeftContainer>
        <SubwayIcon name={normalizedRouteName} isDiamond={isDiamond} />
        <S.MarginLeft>
          {route?.isShuttle ? (
            <S.ShuttleText>
              {props.direction === DIRECTION.UPTOWN
                ? route.northAlias
                : route.southAlias}
            </S.ShuttleText>
          ) : (
            <FontAwesomeIcon
              icon={
                props.direction === DIRECTION.UPTOWN ? faArrowUp : faArrowDown
              }
              color={"white"}
              size={"2x"}
            />
          )}
        </S.MarginLeft>
      </S.LeftContainer>
      <S.RightContainer>
        {!staleTrip ? (
          <S.TimeText
            onClick={() => props.onClickTimeText && props.onClickTimeText()}
            animate={displayArrivingNow}
          >
            {displayArrivingNow ? "Now" : durationStr}
          </S.TimeText>
        ) : (
          <S.TimeText
            onClick={() => props.onClickTimeText && props.onClickTimeText()}
            animate={false}
            textColor="#FCCC0A"
          >{`${durationStr} ago`}</S.TimeText>
        )}
      </S.RightContainer>
    </S.Container>
  );
};
