import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";

export interface DeliveryLog {
  id: number;
  eventId: string;
  webhookUrl: string;
  status: "success" | "failed";
  response: Record<string, unknown> | null;
  attempt: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryStats {
  total: number;
  success: number;
  failed: number;
  successRate: number;
}

export interface DeliveryLogsResponse {
  success: boolean;
  total: number;
  data: DeliveryLog[];
}

export interface DeliveryStatsResponse {
  success: boolean;
  data: DeliveryStats;
}

export interface DeliveryLogByIdResponse {
  success: boolean;
  data: DeliveryLog;
}

export interface DeliveryLogFilters {
  webhookUrl?: string;
  status?: "success" | "failed";
  limit?: number;
  offset?: number;
}

export const deliveryApi = createApi({
  reducerPath: "deliveryApi",
  baseQuery: baseQueryWithReauth(`${process.env.NEXT_PUBLIC_API_URL}/api/delivery`),
  tagTypes: ["DeliveryLog"],
  endpoints: (builder) => ({
    getDeliveryLogs: builder.query<DeliveryLogsResponse, DeliveryLogFilters | void>({
      query: (params) => ({
        url: "/",
        params: params ?? {},
      }),
      providesTags: ["DeliveryLog"],
    }),
    getDeliveryStats: builder.query<DeliveryStatsResponse, void>({
      query: () => "/stats",
      providesTags: ["DeliveryLog"],
    }),
    getDeliveryLogById: builder.query<DeliveryLogByIdResponse, number>({
      query: (id) => `/${id}`,
    }),
  }),
});

export const {
  useGetDeliveryLogsQuery,
  useGetDeliveryStatsQuery,
  useGetDeliveryLogByIdQuery,
} = deliveryApi;