import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store";
import { setCredentials, logout } from "@/store/authSlice";

const rawBaseQuery = (baseUrl: string) =>
  fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken ?? localStorage.getItem("accessToken");
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  });

export const baseQueryWithReauth = (baseUrl: string): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =>
  async (args, api, extraOptions) => {
    let result = await rawBaseQuery(baseUrl)(args, api, extraOptions);

    if (result.error?.status === 401) {
      // try to refresh
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
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
          // save new accessToken
          api.dispatch(setCredentials({ accessToken: data.accessToken }));
          // retry original request
          result = await rawBaseQuery(baseUrl)(args, api, extraOptions);
        } else {
          // refresh failed — logout
          api.dispatch(logout());
          window.location.href = "/login";
        }
      } else {
        api.dispatch(logout());
        window.location.href = "/login";
      }
    }

    return result;
  };