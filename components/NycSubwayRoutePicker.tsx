import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  arrow,
  autoPlacement,
  autoUpdate,
  offset,
  shift,
  size,
  useFloating,
} from "@floating-ui/react-dom";
import { useLongPress } from "use-long-press";
import { useRouter } from "next/router";
import { NycSubwayLoadingView } from "@/components/NycSubwayLoadingView";
import { MtaAlertProps } from "@/components/MtaAlert";
import { getMtaAlertPropsFromRouteAlerts } from "@/utils/AlertUtils";
import { allLines, allRoutes, MtaColors } from "@/utils/SubwayLines";
import { NycSubwayIcon } from "@/components/NycSubwayIcon";
import { Behavior, MtaAlertList } from "@/components/MtaAlertList";
import { PopoverAlertContext } from "@/components/Layout";
import { useQuery } from "react-query";
import { RouteStatuses } from "@/pages/api/route_statuses";
import { Alert } from "@/generated/proto/transiter/public";
import DirectionSelectors, { Direction } from "./DirectionsSelector";

const noRoutesSelected = (
  <span className="font-bold">Select at least 1 route.</span>
);

export default function NycSubwayRoutePicker() {
  const { push } = useRouter();
  const [selectedRoutes, setSelectedRoutes] = useState(new Set<string>());
  const [focusedRoute, setFocusedRoute] = useState<string | undefined>(
    undefined,
  );
  const [northboundAlias, setNorthBoundAlias] = useState<string | undefined>(
    undefined,
  );
  const [southboundAlias, setSouthBoundAlias] = useState<string | undefined>(
    undefined,
  );
  const [direction, setDirection] = useState<Direction | null>(null);
  const [popupAvailableHeight, setPopupAvailableHeight] = useState<
    number | undefined
  >(undefined);

  const { data, isLoading, error } = useQuery(
    ["all_route_statuses", "us-ny-subway"],
    async () => {
      const routeStatusesResp = await fetch(
        "/api/route_statuses?" +
          new URLSearchParams({
            system: "us-ny-subway",
            get_is_running: "true",
          }),
      );
      if (!routeStatusesResp.ok) {
        throw new Error("Failed to fetch route statuses");
      }

      return (await routeStatusesResp.json()) as RouteStatuses[];
    },
    {
      refetchInterval: 10000,
    },
  );

  let routesToDisplay: Set<string> | undefined = undefined;
  let alertsByRoute: Map<string, Alert[]> | undefined = undefined;
  if (data && !error) {
    alertsByRoute = new Map(
      data.map((routeStatus) => [routeStatus.route, routeStatus.alerts]),
    );

    routesToDisplay = new Set(
      data
        .filter(
          (routeStatus) =>
            // If a running status could not be determined, assume it's running
            routeStatus.running === undefined ||
            routeStatus.running ||
            (alertsByRoute?.has(routeStatus.route) &&
              alertsByRoute!.get(routeStatus.route)!.length > 0),
        )
        .map((routeStatus) => routeStatus.route),
    );
  }

  const callback = useCallback(
    (_event: any, { context }: any): void => {
      if (
        alertsByRoute?.has(context.route) &&
        alertsByRoute!.get(context.route)!.length > 0
      ) {
        setFocusedRoute(context.route);
      }
    },
    [alertsByRoute],
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
    whileElementsMounted: autoUpdate,
    middleware: [
      autoPlacement({ allowedPlacements: ["top", "bottom"] }),
      offset(6),
      shift(),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: "min(448px, 100vw)",
            maxWidth: `${availableWidth}px`,
            maxHeight: `${availableHeight}px`,
          });

          setPopupAvailableHeight(availableHeight);
        },
      }),
      arrow({ element: arrowRef }),
    ],
  });

  const directionNotSetError = useMemo(() => {
    return northboundAlias !== undefined
      ? (
        <span className="font-bold">
          Select {northboundAlias} or {southboundAlias}.
        </span>
      )
      : (
        <span className="font-bold inline-flex items-center">
          Select{" "}
          <ArrowUpIcon className="inline-block stroke-[4px] w-4 h-4 mx-1" /> or
          {" "}
          <ArrowDownIcon className="inline-block stroke-[4px] w-4 h-4 ml-1" />.
        </span>
      );
  }, [northboundAlias, southboundAlias]);

  const setAlert = useContext(PopoverAlertContext);
  const handleOnClick = useCallback(() => {
    if (direction == null) {
      setAlert({ type: "error", content: directionNotSetError });
    } else if (selectedRoutes.size === 0) {
      setAlert({ type: "error", content: noRoutesSelected });
    } else {
      push(
        `/us-ny-subway/schedule?routes=${
          Array.from(
            selectedRoutes,
          )
        }&direction=${direction}`,
      );
    }
  }, [push, selectedRoutes, direction, directionNotSetError, setAlert]);

  const formIsValid = selectedRoutes.size > 0 && direction !== null;
  if (isLoading) {
    return <NycSubwayLoadingView />;
  }

  let visibleAlertMessages: MtaAlertProps[] | undefined = undefined;
  if (focusedRoute !== undefined && alertsByRoute?.has(focusedRoute)) {
    visibleAlertMessages = getMtaAlertPropsFromRouteAlerts(
      alertsByRoute.get(focusedRoute) ?? [],
    );
  }

  return (
    <>
      <div className="overflow-auto scrollbar-hide safe-fill-to-bottom text-white">
        {focusedRoute !== undefined && (
          <div
            className="fixed left-0 w-full h-full bg-transparent z-30 select-none"
            onClick={() => setFocusedRoute(undefined)}
          />
        )}
        <div className="sticky top-0 z-50">
          <DirectionSelectors
            direction={direction}
            directionChanged={setDirection}
            northBoundAlias={northboundAlias}
            southBoundAlias={southboundAlias}
          />
        </div>
        <div className="m-2">
          {allLines.map((line) => {
            return (
              <div className="flex mb-3" key={line.name}>
                {line.routes.map((route, routeIdx) => {
                  const routeKey = route.isDiamond
                    ? `${route.name}X`
                    : route.name;
                  if (
                    routesToDisplay !== undefined &&
                    !routesToDisplay.has(routeKey)
                  ) {
                    return null;
                  }

                  const hasAlerts = alertsByRoute?.has(routeKey) &&
                    alertsByRoute.get(routeKey)!.length > 0;

                  const isFocused = routeKey === focusedRoute;
                  const isSelected = selectedRoutes.has(routeKey);

                  return (
                    <div
                      className="relative select-none cursor-pointer ml-3 first-of-type:ml-0 w-[50px] h-[50px]"
                      key={routeKey}
                      ref={isFocused && hasAlerts ? reference : null}
                      {...bind({ route: routeKey })}
                    >
                      {hasAlerts && (
                        <ExclamationCircleIcon className="absolute w-[20px] h-[20px] right-[-5px] top-[-5px] z-30 select-none text-[#FFFF00] animate-alertIconAnimation" />
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
                          <div
                            ref={arrowRef}
                            style={{
                              left: arrowX != null ? `${arrowX}px` : "",
                              top: placement === "top"
                                ? arrowY != null ? `${arrowY}px` : ""
                                : "-4px",
                              bottom: placement === "top" ? "-4px" : "",
                              position: "absolute",
                              background: MtaColors.Yellow,
                              width: "8px",
                              height: "8px",
                              transform: "rotate(45deg)",
                            }}
                          />
                          <div
                            className="relative scrollbar-hide overflow-scroll"
                            style={{ maxHeight: popupAvailableHeight }}
                          >
                            <MtaAlertList
                              alerts={visibleAlertMessages!}
                              behavior={Behavior.Closable}
                              onClose={() => setFocusedRoute(undefined)}
                            />
                          </div>
                        </div>
                      )}
                      <NycSubwayIcon
                        route={route.name}
                        isDiamond={route.isDiamond}
                        width={50}
                        height={50}
                        opacity={isSelected || isFocused ? 1.0 : 0.7}
                        border={isSelected || isFocused
                          ? "4px solid white"
                          : undefined}
                        onClick={() => {
                          // Don't detect a normal click if a long press is happening
                          if (focusedRoute !== undefined) {
                            return;
                          }

                          if (!selectedRoutes.has(routeKey)) {
                            setNorthBoundAlias(route.northAlias);
                            setSouthBoundAlias(route.southAlias);

                            setSelectedRoutes((prevState) => {
                              // If route uses direction aliases, remove other routes with
                              // different aliases from selection
                              for (const otherRoute of allRoutes) {
                                if (
                                  otherRoute.northAlias !== route.northAlias ||
                                  otherRoute.southAlias !== route.southAlias
                                ) {
                                  const routeKey = otherRoute.isDiamond
                                    ? `${otherRoute.name}X`
                                    : otherRoute.name;
                                  prevState.delete(routeKey);
                                }
                              }

                              return new Set(prevState.add(routeKey));
                            });
                          } else {
                            // If last route in alias group, revert aliases to default
                            if (
                              route.useDirectionAliases &&
                              selectedRoutes.size === 1
                            ) {
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
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <button
          className={`sticky bottom-0 bg-black text-2xl font-bold border border-white w-full z-50 py-4 ${
            !formIsValid ? "border-opacity-50" : ""
          }`}
          onClick={handleOnClick}
        >
          <div className={!formIsValid ? "opacity-50" : ""}>
            <span>Get schedule</span>{" "}
            <span className={`${formIsValid ? "arrow-back-and-forth" : ""}`}>
              →
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
