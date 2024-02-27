import { useQuery } from "react-query";

export interface Notice {
  title: string;
  message: string;
  affected_systems: string[];
  timestamp?: number;
}

export function useServiceStatus() {
  const { data, isLoading, error } = useQuery(
    ["service_status"],
    async () => {
      const response = await fetch(
        "https://closing-doors.nyc3.digitaloceanspaces.com/service_status.json",
        {
          mode: "cors", // enable cross-origin requests
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      return data.notices as Notice[];
    },
    {
      refetchInterval: 60000,
      retry: false,
    },
  );

  return { data, isLoading, error } as const;
}
