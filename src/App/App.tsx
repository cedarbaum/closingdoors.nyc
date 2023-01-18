import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { Route, Routes, useLocation } from "react-router-dom";
import { ScheduleView } from "../ScheduleView/ScheduleView";
import { DIRECTION } from "../utils/SubwayLines";
import { Portal } from "../utils/Portal";
import * as S from "./App.styles";
import { RoutePicker } from "../RoutePicker/RoutePicker";
import { setContext } from "@apollo/client/link/context";

// const httpLink = createHttpLink({
//   uri: "/graphql",
// });

// const authLink = setContext((_, { headers }) => {
//   return {
//     headers: {
//       ...headers,
//       "x-api-key": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
//     },
//   };
// });

const client = new ApolloClient({
  uri: '/graphql',
  // link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function routesQueryParamToSet(queryParam: string | null) {
  return queryParam == null
    ? new Set<string>()
    : new Set<string>(queryParam.split(","));
}

function directionQueryParamToDirection(queryParam: string | null) {
  return queryParam === "N" ? DIRECTION.UPTOWN : DIRECTION.DOWNTOWN;
}

export default function App() {
  const query = useQuery();
  const errorDiv = useRef<HTMLDivElement>(null);
  const [displayError, setDisplayError] = useState<JSX.Element | null>(null);
  const [errorDivHeight, setErrorDivHeight] = useState<number | undefined>(
    undefined
  );

  const ref = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setErrorDivHeight((prev) => Math.max(prev ?? 0, node.clientHeight));
    }
  }, []);

  useEffect(() => {
    if (errorDiv.current != null) {
      const errorDivCurrent = errorDiv.current;
      const onAnimationEnd = () => {
        setErrorDivHeight(undefined);
        setDisplayError(null);
      };

      errorDivCurrent.onanimationend = onAnimationEnd;
      return () => {
        errorDivCurrent.onanimationend = null;
      };
    }
  });

  const onError = (error: JSX.Element) => {
    setDisplayError(error);
  };

  return (
    <ApolloProvider client={client}>
      <S.FullscreenBackground>
        <S.Container>
          {displayError != null && errorDivHeight !== undefined && (
            <S.ErrorDisplay animate={true} ref={errorDiv} ty={errorDivHeight}>
              {displayError}
            </S.ErrorDisplay>
          )}
          <S.RouteOutletContainer>
            <Routes>
              <Route path="/" element={<RoutePicker onError={onError} />} />
              <Route
                path="/schedule"
                element={
                  <ScheduleView
                    direction={directionQueryParamToDirection(
                      query.get("direction")
                    )}
                    routes={routesQueryParamToSet(query.get("routes"))}
                  />
                }
              />
            </Routes>
          </S.RouteOutletContainer>
        </S.Container>
      </S.FullscreenBackground>
      {/* Based on https://medium.com/trabe/measuring-non-rendered-elements-in-react-with-portals-c5b7c51aec25 */}
      {displayError != null && (
        <Portal
          children={<S.ErrorDisplay ref={ref}>{displayError}</S.ErrorDisplay>}
          className="measure-layer"
          el="div"
        />
      )}
    </ApolloProvider>
  );
}
