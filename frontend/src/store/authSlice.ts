import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "@/lib/types";

// helper to set a cookie
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
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
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (apiKey) {
        state.apiKey = apiKey;
        localStorage.setItem("apiKey", apiKey);
        setCookie("apiKey", apiKey);          // ← set cookie for middleware
      }
      if (accessToken) {
        state.accessToken = accessToken;
        localStorage.setItem("accessToken", accessToken);
        setCookie("accessToken", accessToken); // ← set cookie for middleware
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
        localStorage.setItem("refreshToken", refreshToken);
      }
      state.isAuthenticated = true;
    },

    logout(state) {
      state.user = null;
      state.apiKey = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("apiKey");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      deleteCookie("apiKey");                 // ← clear cookies
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
          state.isAuthenticated = true;
          setCookie("apiKey", apiKey);         // ← re-sync cookie on restore
        }
        if (accessToken) {
          state.accessToken = accessToken;
          setCookie("accessToken", accessToken);
        }
        if (refreshToken) state.refreshToken = refreshToken;
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