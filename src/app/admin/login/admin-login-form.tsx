"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
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
        setError(res.error.replace("Error: ", "") || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Success → go to staff admin dashboard
      router.replace("/admin");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-[#1D2436] bg-[#0F1420] p-8 shadow-2xl">
      {/* Close / back to home */}
      <a
        href="/"
        title="Back to Home"
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#1D2436] bg-[#090C14] text-[#8891A8] transition-colors hover:border-[#4DE8E0] hover:text-[#4DE8E0]"
      >
        ✕
      </a>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#4DE8E0]/30 bg-[#4DE8E0]/10">
          <ShieldCheck className="h-7 w-7 text-[#4DE8E0]" />
        </div>
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#4DE8E0]">
          Staff Access
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#F3F6FB]">
          Admin Login
        </h1>
        <p className="mt-2 text-sm text-[#8891A8]">
          Enter your admin credentials to access the dashboard.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block font-mono text-xs font-medium uppercase tracking-wider text-[#8891A8]">
            Email Address
          </label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@neosastra.com"
            className="w-full rounded-lg border border-[#1D2436] bg-[#090C14] px-4 py-3 text-sm text-[#F3F6FB] outline-none transition-colors placeholder:text-[#8891A8]/50 focus:border-[#4DE8E0]"
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs font-medium uppercase tracking-wider text-[#8891A8]">
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-[#1D2436] bg-[#090C14] px-4 py-3 pr-11 text-sm text-[#F3F6FB] outline-none transition-colors focus:border-[#4DE8E0]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A8] hover:text-[#F3F6FB]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-[#4DE8E0] px-5 py-3 text-sm font-semibold text-[#090C14] transition-all hover:bg-[#3cd2ca] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In to Admin Portal"}
        </button>
      </form>

      {/* Rate limit warning */}
      <p className="mt-6 text-center text-xs text-[#8891A8]/60">
        🔒 5 failed attempts will lock your IP for 15 minutes
      </p>
    </div>
  );
}
