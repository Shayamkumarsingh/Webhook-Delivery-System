import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";

interface Log {
  _id: string;
  level: string;
  message: string;
  service: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

interface LogStat {
  _id: string;
  count: number;
}

export const logApi = createApi({
  reducerPath: "logApi",
  baseQuery: baseQueryWithReauth(`${process.env.NEXT_PUBLIC_API_URL}/api/logs`),
  tagTypes: ["Log"],
  endpoints: (builder) => ({
    getLogs: builder.query<Log[], { limit?: number; level?: string; service?: string } | void>({
      query: (params) => ({
        url: "/",
        params: params ?? {},
      }),
      providesTags: ["Log"],
    }),
    getLogStats: builder.query<LogStat[], void>({
      query: () => "/stats",
      providesTags: ["Log"],
    }),
  }),
});

export const {
  useGetLogsQuery,
  useGetLogStatsQuery,
} = logApi;