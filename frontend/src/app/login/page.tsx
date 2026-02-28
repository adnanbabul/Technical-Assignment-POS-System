"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error("Invalid email or password");
      }
      const data = await res.json();
      localStorage.setItem("easypos_token", data.accessToken);
      localStorage.setItem("easypos_user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-lg px-10 py-10">
        <div className="mb-8 text-center">
          <div className="text-3xl font-bold">
            Easy <span className="text-orange-500">POS</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to continue to your store.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              suppressHydrationWarning
            />
          </div>
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-orange-500 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">Demo Credentials:</p>
            <p className="text-xs text-slate-600">Email: admin@gmail.com</p>
            <p className="text-xs text-slate-600">Password: admin</p>
          </div>
        </form>
      </div>
    </div>
  );
}

