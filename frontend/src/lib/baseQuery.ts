import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store";
import { setCredentials, logout } from "@/store/authSlice";

const rawBaseQuery = (baseUrl: string) =>
  fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const accessToken =
        state.auth.accessToken ??
        (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);
      const apiKey =
        state.auth.apiKey ??
        (typeof window !== "undefined" ? localStorage.getItem("apiKey") : null);

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      if (apiKey) {
        headers.set("x-api-key", apiKey);
      }
      return headers;
    },
  });

export const baseQueryWithReauth = (
  baseUrl: string
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =>
  async (args, api, extraOptions) => {
    let result = await rawBaseQuery(baseUrl)(args, api, extraOptions);

    if (result.error?.status === 401 || result.error?.status === 403) {
      // try to refresh if refreshToken exists
      const refreshToken =
        typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

      if (refreshToken) {
        try {
          const refreshResult = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            }
          );

          if (refreshResult.ok) {
            const data = await refreshResult.json();
            api.dispatch(setCredentials({ accessToken: data.accessToken }));
            // retry original request with new token
            result = await rawBaseQuery(baseUrl)(args, api, extraOptions);
            return result;
          }
        } catch {
          // Fall through to logout
        }
      }

      // If unauthorized and cannot refresh: force logout and redirect to login
      api.dispatch(logout());
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return result;
  };