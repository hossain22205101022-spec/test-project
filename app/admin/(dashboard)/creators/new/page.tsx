"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, AtSign, Link2, FileText } from "lucide-react";
import Link from "next/link";

export default function NewCreatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: "",
    display_name: "",
    avatar_url: "",
    bio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create creator");
        setLoading(false);
        return;
      }

      router.push("/admin/creators");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/admin/creators"
          className="hover:text-[#3C50E0] transition-colors"
        >
          Creators
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Add New</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/creators"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Creator</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create a new creator profile
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form Card */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-800">
                Creator Information
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Fill in the details for the new creator
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AtSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        username: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_-]/g, ""),
                      }))
                    }
                    required
                    placeholder="johndoe"
                    className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-sm font-mono text-gray-700 outline-none focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/20 transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Lowercase letters, numbers, hyphens, underscores only
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={form.display_name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        display_name: e.target.value,
                      }))
                    }
                    required
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/20 transition-all"
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Avatar URL
                  <span className="ml-1 text-xs text-gray-400 font-normal">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <Link2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="url"
                    value={form.avatar_url}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        avatar_url: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/20 transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Bio
                  <span className="ml-1 text-xs text-gray-400 font-normal">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <FileText
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <textarea
                    value={form.bio}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    rows={3}
                    placeholder="A short bio about this creator..."
                    className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/20 resize-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Bar */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white shadow-sm px-6 py-4">
            <Link
              href="/admin/creators"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !form.username || !form.display_name}
              className="inline-flex items-center gap-2 rounded-lg bg-[#3C50E0] px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3545C4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating..." : "Create Creator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
