"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/types";
import { Image as ImageIcon, FileText, CheckCircle2, ChevronRight, Save, LayoutTemplate, Link as LinkIcon, Eye, History, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogFormProps {
  initialData?: BlogPost;
}

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    image_url: initialData?.image_url || "",
    content: initialData?.content || "",
    published: initialData?.published || false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
      
    // Auto-generate slug from title if it's new
    if (name === "title" && !initialData && !formData.slug) {
      const slugVal = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, title: value, slug: slugVal }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleSlugUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = initialData ? "PUT" : "POST";
      const body = initialData
        ? { id: initialData.id, ...formData }
        : formData;

      const res = await fetch("/api/admin/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save blog");
      }

      router.push("/admin/blogs");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start w-full">
      {/* Sidebar — rendered first in DOM so it appears at top on mobile (above editor),
          then floats right on xl via order utilities */}
      <div className="w-full xl:w-[320px] flex-shrink-0 xl:order-last xl:sticky xl:top-6 order-first">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 xl:gap-6">

        {/* Actions Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-6">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
            Publish Settings
            <div className="flex items-center text-xs font-normal text-gray-500">
              <History className="h-3 w-3 mr-1" />
              Draft
            </div>
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center h-6 mt-0.5">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="rounded-md h-5 w-5 text-black focus:ring-black border-gray-300 transition-colors cursor-pointer"
                />
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-900 group-hover:text-black transition-colors">
                  Publish immediately
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Make this post public as soon as you save.
                </span>
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900 hover:shadow-md"
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {initialData ? "Update Post" : "Save Post"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Media Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-5">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Featured Image</h3>
          
          <div className="space-y-4">
            {formData.image_url ? (
              <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                <img 
                  src={formData.image_url} 
                  alt="Featured preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    type="button" 
                    onClick={() => setFormData(p => ({...p, image_url: ''}))}
                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                  >
                    <AlertCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl aspect-video bg-gray-50/50 text-gray-400">
                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs font-medium">No image connected</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider" htmlFor="image_url">
                Image URL
              </label>
              <input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="block w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-[11px] text-gray-500 leading-tight">
                Provide a high-quality image URL for the blog's cover photo. 1200x630px recommended.
              </p>
            </div>
          </div>
        </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6 w-full min-w-0 overflow-hidden xl:order-first">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          
          {error && (
            <div className="flex items-start gap-3 p-4 text-sm text-red-700 bg-red-50/80 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Error saving blog</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Title & Slug */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2" htmlFor="title">
                <FileText className="h-4 w-4 text-gray-400" />
                Post Title
              </label>
              <input
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="block w-full text-lg font-medium px-4 py-3 rounded-xl border border-gray-200 bg-white placeholder-gray-400 text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-colors"
                placeholder="An amazing blog post..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2" htmlFor="slug">
                <LinkIcon className="h-4 w-4 text-gray-400" />
                URL Slug
              </label>
              <div className="flex rounded-xl shadow-sm border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all">
                <span className="inline-flex items-center px-2 sm:px-4 bg-gray-50 border-r border-gray-200 text-gray-500 text-xs sm:text-sm whitespace-nowrap max-w-[110px] sm:max-w-none truncate flex-shrink-0">
                  <span className="hidden sm:inline">stylefeed.com/</span>blog/
                </span>
                <input
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleSlugUpdate}
                  className="block w-full px-3 py-2.5 bg-white text-sm text-gray-900 border-0 focus:ring-0 placeholder-gray-400"
                  placeholder="awesome-post-url"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Markdown Content Editor */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2" htmlFor="content">
                <LayoutTemplate className="h-4 w-4 text-gray-400" />
                Content body
              </label>
              <div className="flex items-center bg-gray-100/80 p-1 rounded-lg border border-gray-200/50">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === "write"
                      ? "bg-white text-gray-900 shadow-xs ring-1 ring-gray-200/50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === "preview"
                      ? "bg-white text-gray-900 shadow-xs ring-1 ring-gray-200/50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <Eye className="inline h-3.5 w-3.5 mr-1" />
                  Preview
                </button>
              </div>
            </div>
            
            <div className="rounded-xl border border-gray-200 min-h-[260px] sm:min-h-[360px] md:min-h-[440px] overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all bg-white relative">
              {activeTab === "write" ? (
                <textarea
                  id="content"
                  name="content"
                  required
                  value={formData.content}
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full resize-none p-5 text-[15px] leading-relaxed font-mono bg-transparent border-0 focus:ring-0 text-gray-800 placeholder-gray-400"
                  placeholder="## Start writing..."
                />
              ) : (
                <div className="absolute inset-0 w-full h-full p-5 overflow-auto prose prose-sm sm:prose-base max-w-none">
                  {formData.content ? (
                    <ReactMarkdown>{formData.content}</ReactMarkdown>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <LayoutTemplate className="h-10 w-10 mb-3 opacity-20" />
                      <p>Nothing to preview yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 flex flex-col sm:flex-row justify-between gap-1">
              <span>Supports GitHub Flavored Markdown</span>
              <span className="tabular-nums">{formData.content.length} characters</span>
            </p>
          </div>
        </div>
      </div>

    </form>
  );
}