import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";

interface DLQEntry {
  _id: string;
  webhookId: string;
  payload: Record<string, unknown>;
  error: string;
  retryCount: number;
  createdAt: string;
}

interface DLQResponse {
  success: boolean;
  data: DLQEntry[];
}

export const dlqApi = createApi({
  reducerPath: "dlqApi",
  baseQuery: baseQueryWithReauth(`${process.env.NEXT_PUBLIC_API_URL}/api/dlq`),
  tagTypes: ["DLQ"],
  endpoints: (builder) => ({
    getDLQ: builder.query<DLQResponse, void>({
      query: () => "/",
      providesTags: ["DLQ"],
    }),
    retryDLQ: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/retry/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["DLQ"],
    }),
    deleteDLQ: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DLQ"],
    }),
  }),
});

export const {
  useGetDLQQuery,
  useRetryDLQMutation,
  useDeleteDLQMutation,
} = dlqApi;