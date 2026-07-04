export interface User {
  id: number;
  email: string;
}

export interface AuthState {
  user: User | null;
  apiKey: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface Webhook {
  id: number;
  userId: string;
  url: string;
  eventType: string;
  secret: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookCreatePayload {
  url: string;
  eventType: string;
}

export interface Event {
  _id: string;
  userId: string;
  email: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: "pending" | "published" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface EventCreatePayload {
  eventType: string;
  email: string;
  payload?: Record<string, unknown>;
}

export interface Log {
  _id: string;
  service: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface LogStats {
  _id: string;
  count: number;
}

export interface DLQEntry {
  _id: string;
  event: Record<string, unknown>;
  webhook: Record<string, unknown>;
  reason: string;
  attempts: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}