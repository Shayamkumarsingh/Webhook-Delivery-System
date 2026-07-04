"use client";

import { store } from "@/store";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { restoreSession } from "@/store/authSlice";

function SessionRestorer() {
  useEffect(() => {
    store.dispatch(restoreSession());
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionRestorer />
      {children}
      <Toaster />
    </Provider>
  );
}