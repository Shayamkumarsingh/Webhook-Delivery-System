"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store";
import { restoreSession } from "@/store/authSlice";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken, apiKey } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Restore session credentials from local storage & cookies
    dispatch(restoreSession());

    const storedApiKey = typeof window !== "undefined" ? localStorage.getItem("apiKey") : null;
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const hasValidAuth = Boolean(
      isAuthenticated || accessToken || apiKey || storedApiKey || storedToken
    );

    if (!hasValidAuth) {
      router.replace("/login");
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, accessToken, apiKey, dispatch, router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen w-full bg-[#090d16] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="size-7 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono tracking-wide">
          Verifying security authorization…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
