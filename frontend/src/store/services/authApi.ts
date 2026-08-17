import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/auth`,
  }),
  endpoints: (builder) => ({
    register: builder.mutation<
      {
        success: boolean;
        data: {
          id: number;
          email: string;
          apiKey: string;
        };
      },
      {
        email: string;
        password: string;
      }
    >({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<
      {
        success: boolean;
        accessToken: string;
        refreshToken: string;
        apiKey?: string;
        user: {
          id: number;
          email: string;
          apiKey?: string;
        };
      },
      {
        email: string;
        password: string;
      }
    >({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<
      {
        success: boolean;
        data: {
          id: number;
          email: string;
        };
      },
      void
    >({
      query: () => ({
        url: "/me",
        headers: {
          "x-api-key":
            typeof window !== "undefined"
              ? localStorage.getItem("apiKey") ?? ""
              : "",
        },
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
} = authApi;