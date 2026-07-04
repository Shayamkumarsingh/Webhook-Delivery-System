import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";

export interface RateLimitCheckPayload {
  identifier: string;
  options?: {
    capacity?: number;
    refillRate?: number;
  };
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  reset: number;
}

export interface RateLimitResetPayload {
  identifier: string;
}

export const rateLimitApi = createApi({
  reducerPath: "rateLimitApi",

  baseQuery: baseQueryWithReauth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/rate-limit`
  ),

  endpoints: (builder) => ({
    checkRateLimit: builder.mutation<
      RateLimitCheckResult,
      RateLimitCheckPayload
    >({
      query: (body) => ({
        url: "/check",
        method: "POST",
        body,
      }),
    }),

    resetRateLimit: builder.mutation<
      { message: string },
      RateLimitResetPayload
    >({
      query: (body) => ({
        url: "/reset",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCheckRateLimitMutation,
  useResetRateLimitMutation,
} = rateLimitApi;