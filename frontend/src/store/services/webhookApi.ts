import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { ApiResponse, Webhook, WebhookCreatePayload } from "@/lib/types";

export const webhookApi = createApi({
  reducerPath: "webhookApi",
  baseQuery: baseQueryWithReauth(`${process.env.NEXT_PUBLIC_API_URL}/api/webhooks`),
  tagTypes: ["Webhook"],
  endpoints: (builder) => ({
    getWebhooks: builder.query<ApiResponse<Webhook[]>, { eventType?: string } | void>({
      query: (params) => ({
        url: "/getall",
        params: params ?? {},
      }),
      providesTags: ["Webhook"],
    }),
    createWebhook: builder.mutation<ApiResponse<Webhook>, WebhookCreatePayload>({
      query: (body) => ({ url: "/create", method: "POST", body }),
      invalidatesTags: ["Webhook"],
    }),
    deleteWebhook: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["Webhook"],
    }),
  }),
});

export const {
  useGetWebhooksQuery,
  useCreateWebhookMutation,
  useDeleteWebhookMutation,
} = webhookApi;