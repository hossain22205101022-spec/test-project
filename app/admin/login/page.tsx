"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Mail, Lock, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Check if user is admin
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      const { data: adminData } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!adminData) {
        setError("You do not have admin access.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard
      window.location.href = "/admin";
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1C2434] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#3C50E0]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#60A5FA]/10 blur-3xl" />

        <div className="relative z-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3C50E0] to-[#60A5FA] bg-clip-text text-transparent">
            StyleFeed
          </h1>
          <p className="text-[#8A99AF] text-sm mt-1">Admin Panel</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Manage your
            <br />
            platform with ease
          </h2>
          <p className="text-[#8A99AF] text-base max-w-md leading-relaxed">
            Create posts, manage creators, and track your social commerce
            platform all from one clean dashboard.
          </p>
          <div className="flex items-center gap-6 text-sm text-[#8A99AF]">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#12B76A]" />
              Real-time analytics
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#3C50E0]" />
              Content management
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#8A99AF]/60">
          &copy; {new Date().getFullYear()} StyleFeed. All rights reserved.
        </p>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-[#F1F5F9] px-4 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#3C50E0] to-[#60A5FA] bg-clip-text text-transparent">
              StyleFeed
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Admin Panel</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Welcome back</h2>
              <p className="text-sm text-gray-500 mt-1">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/20 transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#3C50E0] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3545C4] disabled:opacity-50 transition-colors"
              >
                <LogIn size={16} />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <a
                href="/feed"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#3C50E0] transition-colors"
              >
                <ArrowLeft size={14} />
                Back to site
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
