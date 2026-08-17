import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "@/lib/types";

// helper to set a cookie
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

const initialState: AuthState = {
  user: null,
  apiKey: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user?: { id: number; email: string };
        apiKey?: string;
        accessToken?: string;
        refreshToken?: string;
      }>
    ) {
      const { user, apiKey, accessToken, refreshToken } = action.payload;

      if (user) {
        state.user = user;
        if (typeof window !== "undefined") localStorage.setItem("user", JSON.stringify(user));
      }
      if (apiKey) {
        state.apiKey = apiKey;
        if (typeof window !== "undefined") localStorage.setItem("apiKey", apiKey);
        setCookie("apiKey", apiKey);
      }
      if (accessToken) {
        state.accessToken = accessToken;
        if (typeof window !== "undefined") localStorage.setItem("accessToken", accessToken);
        setCookie("accessToken", accessToken);
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
        if (typeof window !== "undefined") localStorage.setItem("refreshToken", refreshToken);
      }
      state.isAuthenticated = Boolean(state.apiKey || state.accessToken);
    },

    logout(state) {
      state.user = null;
      state.apiKey = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("apiKey");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
      deleteCookie("apiKey");
      deleteCookie("accessToken");
    },

    restoreSession(state) {
      if (typeof window !== "undefined") {
        const apiKey = localStorage.getItem("apiKey");
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const userRaw = localStorage.getItem("user");

        if (apiKey) {
          state.apiKey = apiKey;
          setCookie("apiKey", apiKey);
        }
        if (accessToken) {
          state.accessToken = accessToken;
          setCookie("accessToken", accessToken);
        }
        if (refreshToken) {
          state.refreshToken = refreshToken;
        }
        if (apiKey || accessToken) {
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }

        if (userRaw) {
          try {
            state.user = JSON.parse(userRaw);
          } catch {
            localStorage.removeItem("user");
          }
        }
      }
    },
  },
});

export const { setCredentials, logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;