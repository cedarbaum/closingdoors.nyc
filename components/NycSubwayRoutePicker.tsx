import Head from "next/head";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import {
  Alert,
  Direction,
  RouteStatusesDocument,
  RouteStatusesQuery,
} from "@/generated/gql/graphql";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  autoUpdate,
  arrow,
  autoPlacement,
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
import { ReactNode } from "react";
import { MtaColors, allLines } from "@/utils/SubwayLines";
import { NycSubwayIcon } from "@/components/NycSubwayIcon";
import { MtaAlertList, Behavior } from "@/components/MtaAlertList";
import { PopoverAlertContext } from "@/components/Layout";
import useQueryWithPolling from "@/utils/useQueryWithPolling";

const noRoutesSelected = <>Select at least 1 route.</>;

export default function NycSubwayRoutePicker() {
  const { push } = useRouter();
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
  const [direction, setDirection] = useState<Direction | null>(null);
  const [popupAvailableHeight, setPopupAvailableHeight] = useState<
    number | undefined
  >(undefined);

  const [result] = useQueryWithPolling<RouteStatusesQuery>(
    {
      query: RouteStatusesDocument,
    },
    30000
  );
  const { data, fetching, error } = result;

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
    (_event: any, { context }: any): void => {
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
    whileElementsMounted: autoUpdate,
    middleware: [
      autoPlacement({ allowedPlacements: ["top", "bottom"] }),
      offset(6),
      shift(),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: "min(432px, 100vw)",
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
    return northboundAlias !== undefined ? (
      <>
        Select <span>{northboundAlias}</span> or <span>{southboundAlias}</span>.
      </>
    ) : (
      <>
        Select <ArrowUpIcon className="inline-block stroke-[4px] w-4 h-4" /> or{" "}
        <ArrowDownIcon className="inline-block stroke-[4px] w-4 h-4" />.
      </>
    );
  }, [northboundAlias, southboundAlias]);

  const setAlert = useContext(PopoverAlertContext);
  const handleOnClick = useCallback(() => {
    if (direction == null) {
      setAlert(directionNotSetError);
    } else if (selectedRoutes.size === 0) {
      setAlert(noRoutesSelected);
    } else {
      push(
        `/us-ny-subway/schedule?routes=${Array.from(
          selectedRoutes
        )}&direction=${direction}`
      );
    }
  }, [
    push,
    selectedRoutes,
    direction,
    directionNotSetError,
    setAlert,
  ]);

  const formIsValid = selectedRoutes.size > 0 && direction !== null;
  if (fetching) {
    return <NycSubwayLoadingView />;
  }

  let visibleAlertMessages: MtaAlertProps[] | undefined = undefined;
  if (focusedRoute !== undefined && alertsByRoute?.has(focusedRoute)) {
    visibleAlertMessages = getMtaAlertPropsFromRouteAlerts(
      alertsByRoute.get(focusedRoute) ?? []
    );
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="overflow-scroll h-full scrollbar-hide text-white">
        {focusedRoute !== undefined && (
          <div
            className="absolute left-0 w-full h-full bg-transparent z-30 select-none"
            onClick={() => setFocusedRoute(undefined)}
          />
        )}
        <DirectionSelectors
          direction={direction}
          directionChanged={setDirection}
          northBoundAlias={northboundAlias}
          southBoundAlias={southboundAlias}
        />
        <div className="m-2">
          {allLines.map((line) => {
            return (
              <div className="flex mb-2" key={line.name}>
                {line.routes.map((route, routeIdx) => {
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
                  const isSelected = selectedRoutes.has(routeKey);

                  return (
                    <div
                      className="relative select-none cursor-pointer ml-3 first-of-type:ml-0"
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
                              top:
                                placement === "top"
                                  ? arrowY != null
                                    ? `${arrowY}px`
                                    : ""
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
                            className="scrollbar-hide overflow-scroll"
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
                        border={
                          isSelected || isFocused
                            ? "4px solid white"
                            : undefined
                        }
                        onClick={() => {
                          // Don't detect a normal click if a long press is happening
                          if (focusedRoute !== undefined) {
                            return;
                          }

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
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <button
          className="sticky bg-black bottom-0 w-full z-50 py-4"
          onClick={handleOnClick}
        >
          <span
            className={`text-2xl font-bold ${!formIsValid ? "opacity-50" : ""}`}
          >
            Get schedule
          </span>
        </button>
      </div>
    </>
  );
}

interface DirectionsSelectorProps {
  direction: Direction | null;
  directionChanged: (direction: Direction) => void;
  northBoundAlias?: string;
  southBoundAlias?: string;
}

function DirectionSelectors({
  direction,
  directionChanged,
  northBoundAlias,
  southBoundAlias,
}: DirectionsSelectorProps) {
  return (
    <div className="w-full bg-black flex sticky top-0 z-50 text-2xl">
      <DirectionSelector
        onClick={() => directionChanged(Direction.North)}
        selected={direction === Direction.North}
      >
        {(selected) =>
          northBoundAlias ? (
            <span
              className={`text-white text-[40px] ${
                selected ? "font-bold" : "opacity-50"
              }`}
            >
              {northBoundAlias}
            </span>
          ) : (
            <ArrowUpIcon
              className={`h-full w-full ${
                selected ? "stroke-[3px]" : "opacity-50"
              }`}
            />
          )
        }
      </DirectionSelector>
      <DirectionSelector
        onClick={() => directionChanged(Direction.South)}
        selected={direction === Direction.South}
      >
        {(selected) =>
          southBoundAlias ? (
            <span
              className={`text-white text-[40px] ${
                selected ? "font-bold" : "opacity-50"
              }`}
            >
              {southBoundAlias}
            </span>
          ) : (
            <ArrowDownIcon
              className={`h-full w-full ${
                selected ? "stroke-[3px]" : "opacity-50"
              }`}
            />
          )
        }
      </DirectionSelector>
    </div>
  );
}

interface DirectionSelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: (selected: boolean) => ReactNode;
  selected?: boolean;
}

function DirectionSelector({
  children,
  selected,
  ...rest
}: DirectionSelectorProps) {
  return (
    <div className="flex justify-center items-center w-1/2 h-20 p-4" {...rest}>
      {children(selected ?? false)}
    </div>
  );
}
