import React, { useCallback, useRef, useState } from "react";

import { SubwayIcon } from "../SubwayIcon/SubwayIcon";
import { allLines, DIRECTION } from "../utils/SubwayLines";
import { faArrowUp, faArrowDown } from "@fortawesome/pro-light-svg-icons";
import {
  faArrowUp as boldFaArrowUp,
  faArrowDown as boldFaArrowDown,
  faExclamationCircle,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import * as S from "./RoutePicker.styles";
import { useQuery } from "@apollo/client";
import { LoadingView } from "../LoadingView/LoadingView";
import {
  Alert,
  RouteStatusesDocument,
  RouteStatusesQuery,
} from "../graphql/generated";
import { AlertsHeader, Behavior } from "../AlertsHeader/AlertsHeader";
import Popup from "reactjs-popup";
import { AlertProps } from "../Alert/Alert";
import { useLongPress } from "use-long-press";
import {
  arrow,
  autoPlacement,
  offset,
  shift,
  size,
  useFloating,
} from "@floating-ui/react-dom";

interface RoutePickerProps {
  onError?(error: JSX.Element): void;
}

export const RoutePicker: React.FC<RoutePickerProps> = (props) => {
  const [selectedRoutes, setSelectedRoutes] = useState(new Set<string>());
  const [focusedRoute, setFocusedRoute] = useState<string | undefined>(
    undefined
  );
  const [northboundAlias, setNorthBoundAlias] = useState<string | undefined>(
    undefined
  );
  const [southboundAlias, setSouthBoundAlias] = useState<string | undefined>(
    undefined
  );
  const [direction, setDirection] = useState<DIRECTION | null>(null);
  const [popupAvailableHeight, setPopupAvailableHeight] = useState<
    number | undefined
  >(undefined);

  const navigate = useNavigate();
  const { loading, error, data } = useQuery<RouteStatusesQuery>(
    RouteStatusesDocument,
    {
      pollInterval: 30000,
    }
  );

  let runningRoutes: Set<string> | undefined = undefined;
  let alertsByRoute: Map<string, Alert[]> | undefined = undefined;
  if (data && !error) {
    runningRoutes = new Set(
      data!
        .routeStatuses!.filter((routeStatus) => routeStatus.running)
        .map((routeStatus) => routeStatus.routeId)
    );

    alertsByRoute = new Map(
      data!.routeStatuses.map((routeStatus) => [
        routeStatus.routeId,
        routeStatus.alerts,
      ])
    );
  }

  const callback = useCallback(
    (_event, { context }) => {
      if (
        alertsByRoute?.has(context.route) &&
        alertsByRoute!.get(context.route)!.length > 0
      ) {
        setFocusedRoute(context.route);
      }
    },
    [alertsByRoute]
  );

  const bind = useLongPress(callback, {
    filterEvents: () => true,
  });

  const arrowRef = useRef(null);

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    placement,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    middleware: [
      autoPlacement({ allowedPlacements: ["top", "bottom"] }),
      offset(6),
      shift(),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          // Do things with the data, e.g.
          Object.assign(elements.floating.style, {
            minWidth: "min(480px, 100vw)",
            maxWidth: `${availableWidth}px`,
            maxHeight: `${availableHeight}px`,
          });

          setPopupAvailableHeight(availableHeight);
        },
      }),
      arrow({ element: arrowRef }),
    ],
  });

  const directionNotSetError =
    northboundAlias !== undefined ? (
      <>
        Select <S.SpanWithBlackText>{northboundAlias}</S.SpanWithBlackText> or{" "}
        <S.SpanWithBlackText>{southboundAlias}</S.SpanWithBlackText>.
      </>
    ) : (
      <>
        Select <FontAwesomeIcon icon={boldFaArrowUp} color={"black"} /> or{" "}
        <FontAwesomeIcon icon={boldFaArrowDown} color={"black"} />.
      </>
    );
  const noRoutesSelected = <>Select at least 1 route.</>;

  const handleOnClick = useCallback(() => {
    if (direction == null) {
      props.onError && props.onError(directionNotSetError);
    } else if (selectedRoutes.size === 0) {
      props.onError && props.onError(noRoutesSelected);
    } else {
      navigate(
        `/schedule?routes=${Array.from(selectedRoutes)}&direction=${direction}`
      );
    }
  }, [navigate, selectedRoutes, direction]);

  const uptownArrowColor =
    direction === DIRECTION.UPTOWN ? "white" : "#ffffffab";
  const uptownArrowIcon =
    direction === DIRECTION.UPTOWN ? boldFaArrowUp : faArrowUp;
  const downtownArrowColor =
    direction === DIRECTION.DOWNTOWN ? "white" : "#ffffffab";
  const downtownArrowIcon =
    direction === DIRECTION.DOWNTOWN ? boldFaArrowDown : faArrowDown;

  const formIsValid = selectedRoutes.size > 0 && direction !== null;
  const submitButtonTextColor = formIsValid ? "white" : "#ffffffab";

  if (loading) {
    return <LoadingView />;
  }

  let visibleAlertMessages: AlertProps[] | undefined = undefined;
  if (focusedRoute !== undefined && alertsByRoute?.has(focusedRoute)) {
    visibleAlertMessages = alertsByRoute
      .get(focusedRoute)
      ?.map((alert) => {
        const enHtmlHeader = alert?.messages?.headers?.find(
          (header) => header.language === "en-html"
        );
        const enHtmlDescription = alert?.messages?.descriptions?.find(
          (header) => header.language === "en-html"
        );

        const enHeader = alert?.messages?.headers?.find(
          (header) => header.language === "en"
        );
        const enDescription = alert?.messages?.descriptions?.find(
          (header) => header.language === "en"
        );

        return enHtmlHeader !== undefined
          ? { header: enHtmlHeader?.text, description: enHtmlDescription?.text }
          : { header: enHeader?.text, description: enDescription?.text };
      })
      ?.filter(({ header }) => header !== undefined);
  }

  return (
    <S.Container>
      {false && visibleAlertMessages !== undefined && (
        <Popup
          modal
          open
          position={"top center"}
          onClose={() => setFocusedRoute(undefined)}
        >
          {(close: () => void) => (
            <div style={{ maxWidth: "480px" }}>
              <AlertsHeader
                alerts={visibleAlertMessages!}
                behavior={Behavior.Closable}
                onClose={close}
              />
            </div>
          )}
        </Popup>
      )}
      <S.ArrowsContainer>
        <S.ArrowContainer onClick={() => setDirection(DIRECTION.UPTOWN)}>
          {northboundAlias !== undefined ? (
            <S.ShuttleText
              color={uptownArrowColor}
              isBold={direction === DIRECTION.UPTOWN}
            >
              {northboundAlias}
            </S.ShuttleText>
          ) : (
            <FontAwesomeIcon
              size={"lg"}
              icon={uptownArrowIcon}
              color={uptownArrowColor}
            />
          )}
        </S.ArrowContainer>
        <S.ArrowContainer onClick={() => setDirection(DIRECTION.DOWNTOWN)}>
          {northboundAlias !== undefined ? (
            <S.ShuttleText
              color={downtownArrowColor}
              isBold={direction === DIRECTION.DOWNTOWN}
            >
              {southboundAlias}
            </S.ShuttleText>
          ) : (
            <FontAwesomeIcon
              size={"lg"}
              icon={downtownArrowIcon}
              color={downtownArrowColor}
            />
          )}
        </S.ArrowContainer>
      </S.ArrowsContainer>
      <S.RoutesContainer>
        {allLines.map((line) => {
          return (
            <S.IconContainer key={line.name}>
              {line.routes.map((route) => {
                const routeKey = route.isDiamond
                  ? `${route.name}X`
                  : route.name;
                if (
                  runningRoutes !== undefined &&
                  !runningRoutes.has(routeKey)
                ) {
                  return null;
                }

                const hasAlerts =
                  alertsByRoute?.has(routeKey) &&
                  alertsByRoute.get(routeKey)!.length > 0;

                const isFocused = routeKey === focusedRoute;

                return (
                  <S.SubwayIconContainer
                    key={`${routeKey}IconContainer`}
                    ref={isFocused && hasAlerts ? reference : null}
                    {...bind({ route: routeKey })}
                  >
                    {hasAlerts && (
                      <S.UpperRightIcon
                        animate={"true"}
                        icon={faExclamationCircle}
                        color={"yellow"}
                      />
                    )}
                    {isFocused && hasAlerts && (
                      <div
                        ref={floating}
                        style={{
                          position: strategy,
                          top: y ?? 0,
                          left: x ?? 0,
                          zIndex: 1000,
                          overflow: "visible",
                        }}
                      >
                        <S.AlertsHeaderContainer
                          maxHeight={popupAvailableHeight}
                        >
                          <AlertsHeader
                            alerts={visibleAlertMessages!}
                            behavior={Behavior.Closable}
                            onClose={() => setFocusedRoute(undefined)}
                          />
                        </S.AlertsHeaderContainer>
                        <div
                          ref={arrowRef}
                          style={{
                            left: arrowX != null ? `${arrowX}px` : "",
                            top:
                              placement === "top"
                                ? arrowY != null
                                  ? `${arrowY}px`
                                  : ""
                                : "-4px",
                            bottom: placement === "top" ? "-4px" : "",
                            position: "absolute",
                            background: "#FCCC0A",
                            width: "8px",
                            height: "8px",
                            transform: "rotate(45deg)",
                          }}
                        />
                      </div>
                    )}
                    <SubwayIcon
                      key={routeKey}
                      {...route}
                      opacity={
                        selectedRoutes.has(routeKey) || isFocused ? 1.0 : 0.7
                      }
                      border={
                        selectedRoutes.has(routeKey)
                          ? "3px solid white"
                          : undefined
                      }
                      onClick={() => {
                        // Don't detect a normal click if a long press is happening
                        if (focusedRoute !== undefined) {
                          return;
                        }

                        // BUG: Below case shouldn't ne needed, but for some reason adding an element
                        // to the initial empty set doesn't correctly update state on next render.
                        // Creating a new set without relying on prevState fixes this.
                        if (selectedRoutes.size === 0 || route.isShuttle) {
                          setNorthBoundAlias(route.northAlias);
                          setSouthBoundAlias(route.southAlias);
                          setSelectedRoutes(new Set([routeKey]));
                        }

                        if (!selectedRoutes.has(routeKey)) {
                          if (!route.isShuttle) {
                            setNorthBoundAlias(undefined);
                            setSouthBoundAlias(undefined);
                          }

                          setSelectedRoutes((prevState) => {
                            for (var line of allLines) {
                              for (var route of line.routes) {
                                if (route.isShuttle) {
                                  const routeKey = route.isDiamond
                                    ? `${route.name}X`
                                    : route.name;
                                  prevState.delete(routeKey);
                                }
                              }
                            }

                            return new Set(prevState.add(routeKey));
                          });
                        } else {
                          if (route.isShuttle) {
                            setNorthBoundAlias(undefined);
                            setSouthBoundAlias(undefined);
                          }
                          setSelectedRoutes((prevState) => {
                            prevState.delete(routeKey);
                            return new Set(prevState);
                          });
                        }
                      }}
                    />
                  </S.SubwayIconContainer>
                );
              })}
            </S.IconContainer>
          );
        })}
      </S.RoutesContainer>
      <S.SubmitButton textColor={submitButtonTextColor} onClick={handleOnClick}>
        Get schedule
      </S.SubmitButton>
    </S.Container>
  );
};
