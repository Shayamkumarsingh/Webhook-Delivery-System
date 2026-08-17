"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation, useRegisterMutation } from "@/store/services/authApi";
import { setCredentials } from "@/store/authSlice";
import { useAppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const isLoading = isLoginLoading || isRegisterLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const result = await register({ email, password }).unwrap();
        dispatch(
          setCredentials({
            apiKey: result.data.apiKey,
            user: { id: result.data.id, email: result.data.email },
          })
        );
        toast.success("Account created successfully", {
          description: `API key generated: ${result.data.apiKey}`,
        });
        router.push("/dashboard");
      } else {
        const result = await login({ email, password }).unwrap();
        dispatch(
          setCredentials({
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            apiKey: result.user?.apiKey || result.apiKey,
          })
        );
        toast.success("Signed in successfully");
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data: { message: string } }).data?.message
          : "Authentication failed. Please check your credentials.";
      toast.error("Authentication Error", {
        description: message,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090d16] text-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden bg-grid-mesh">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[400px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-6">
          {/* Header & Tabs */}
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isRegister ? "Create an account" : "Welcome back"}
              </h1>
              <p className="text-xs text-slate-400">
                {isRegister
                  ? "Sign up with your work email to get started"
                  : "Enter your credentials to access your dashboard"}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="p-1 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={cn(
                  "py-2 rounded-lg transition-all",
                  !isRegister
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={cn(
                  "py-2 rounded-lg transition-all",
                  isRegister
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-300">Email Address</Label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="developer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs h-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-slate-300">Password</Label>
                {isRegister && (
                  <span className="text-[11px] text-slate-500">Min. 6 chars</span>
                )}
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 bg-slate-950/80 border-slate-800 focus-visible:border-blue-500 text-xs h-10 font-mono"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/20 text-xs mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  {isRegister ? "Creating account…" : "Signing in…"}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isRegister ? "Create Account" : "Sign In"}
                  <ArrowRight size={14} />
                </span>
              )}
            </Button>
          </form>

          {/* Footer toggle */}
          <div className="pt-2 text-center text-xs text-slate-400">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 ml-1 transition-colors"
            >
              {isRegister ? "Sign in" : "Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}