import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";

export interface Event {
  _id?: string;
  id?: string;
  eventType: string;
  email: string;
  payload: Record<string, unknown>;
  userId: string;
  createdAt: string;
}

interface EventResponse {
  success: boolean;
  data: Event;
}

interface CreateEventPayload {
  eventType: string;
  email: string;
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
}

export const eventApi = createApi({
  reducerPath: "eventApi",
  baseQuery: baseQueryWithReauth(`${process.env.NEXT_PUBLIC_API_URL}/api/events`),
  tagTypes: ["Event"],
  endpoints: (builder) => ({
    createEvent: builder.mutation<EventResponse, CreateEventPayload>({
      query: ({ idempotencyKey, ...body }) => ({
        url: "/",
        method: "POST",
        body,
        headers: idempotencyKey
          ? { "idempotency-key": idempotencyKey }
          : undefined,
      }),
      invalidatesTags: ["Event"],
    }),
  }),
});

export const { useCreateEventMutation } = eventApi;