"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Eye, EyeOff, AlertCircle, X } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/superadmin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-[#1D2436] bg-[#0F1420] p-8 shadow-2xl">
      <a
        href="/"
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB] hover:border-[#4DE8E0] transition-colors"
        title="Go to Home"
      >
        <X className="h-4 w-4" />
      </a>

      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4DE8E0] to-[#8B7CFF]">
          <ShieldCheck className="h-6 w-6 text-[#090C14]" />
        </div>
        <span className="mb-1 font-mono text-xs uppercase tracking-widest text-[#4DE8E0]">
          System Access
        </span>
        <h1 className="text-2xl font-bold text-[#F3F6FB]">Admin Login</h1>
        <p className="mt-1 text-sm text-[#8891A8]">Sign in to manage Neos Astra</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-[#8891A8] mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
            placeholder="you@neosastra.com"
          />
        </div>

        <div>
          <label className="block text-xs text-[#8891A8] mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-11 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8891A8] hover:text-[#F3F6FB] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-xl bg-gradient-to-r from-[#4DE8E0] to-[#8B7CFF] py-3 text-sm font-semibold text-[#090C14] transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}