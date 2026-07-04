import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./authSlice";
import { authApi } from "./services/authApi";
import { webhookApi } from "./services/webhookApi";
import { eventApi } from "./services/eventApi";
import { logApi } from "./services/logApi";
import { dlqApi } from "./services/dlqApi";
import { rateLimitApi } from "./services/rateLimitApi";
import { deliveryApi } from "./services/deliveryApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [webhookApi.reducerPath]: webhookApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
    [logApi.reducerPath]: logApi.reducer,
    [dlqApi.reducerPath]: dlqApi.reducer,
    [rateLimitApi.reducerPath]: rateLimitApi.reducer,
    [deliveryApi.reducerPath]: deliveryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      webhookApi.middleware,
      eventApi.middleware,
      logApi.middleware,
      dlqApi.middleware,
      rateLimitApi.middleware,
      deliveryApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;