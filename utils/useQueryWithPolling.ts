import { useEffect } from "react";
import { AnyVariables, UseQueryArgs, UseQueryResponse, useQuery } from "urql";

export default function useQueryWithPolling<
  Data = any,
  Variables extends AnyVariables = AnyVariables
>(
  args: UseQueryArgs<Variables, Data>,
  pollingInterval: number
): UseQueryResponse<Data, Variables> {
  const [result, reexecuteQuery] = useQuery<Data, Variables>(args);

  useEffect(() => {
    if (result.fetching) return;

    const interval = setInterval(() => {
      reexecuteQuery({ requestPolicy: "cache-and-network" });
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [result.fetching, reexecuteQuery]);

  return [result, reexecuteQuery];
}
