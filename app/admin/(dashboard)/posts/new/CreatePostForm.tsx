"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  X,
  ImageIcon,
  Loader2,
  Package,
  Hash,
  Link2,
  Film,
  Upload,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import type { Creator } from "@/types";

interface ProductInput {
  name: string;
  retailer: string;
  price: string;
  affiliate_url: string;
  image_url: string;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/15 hover:border-gray-300";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

export default function CreatePostForm({ creators }: { creators: Creator[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(
    new Set()
  );

  const [form, setForm] = useState({
    creator_id: creators[0]?.id || "",
    description: "",
    hashtags: "",
    image_url: "",
    video_url: "",
    slug: "",
  });
  const [products, setProducts] = useState<ProductInput[]>([]);

  const selectedCreator = creators.find((c) => c.id === form.creator_id);
  const hashtagList = form.hashtags
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean);

  /* ── Helpers ─────────────────────────────────────── */
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .slice(0, 60);

  const handleDescriptionChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      description: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  /* ── Image ────────────────────────────────────────── */
  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "images");
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((p) => ({ ...p, image_url: data.url }));
      } else {
        setError(data.error || "Image upload failed. Please try again or paste a URL.");
        setImagePreview(null);
      }
    } catch {
      setError("Image upload failed. Check your connection and try again.");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) uploadFile(file);
  };

  /* ── Video ────────────────────────────────────────── */
  const uploadVideoFile = async (file: File) => {
    setVideoUploading(true);
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "videos");
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((p) => ({ ...p, video_url: data.url }));
      } else {
        setError(data.error || "Video upload failed. Please try again.");
        setVideoPreview(null);
      }
    } catch {
      setError("Video upload failed. Check your connection and try again.");
      setVideoPreview(null);
    } finally {
      setVideoUploading(false);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadVideoFile(file);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) uploadVideoFile(file);
  };

  /* ── Products ─────────────────────────────────────── */
  const addProduct = () => {
    const idx = products.length;
    setProducts((p) => [
      ...p,
      { name: "", retailer: "", price: "", affiliate_url: "", image_url: "" },
    ]);
    setExpandedProducts((s) => new Set([...s, idx]));
  };

  const removeProduct = (index: number) => {
    setProducts((p) => p.filter((_, i) => i !== index));
    setExpandedProducts((s) => {
      const next = new Set<number>();
      s.forEach((v) => { if (v < index) next.add(v); else if (v > index) next.add(v - 1); });
      return next;
    });
  };

  const toggleProduct = (index: number) => {
    setExpandedProducts((s) => {
      const next = new Set(s);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const updateProduct = (i: number, field: keyof ProductInput, value: string) =>
    setProducts((p) => p.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  /* ── Submit ───────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        post: {
          creator_id: form.creator_id,
          image_url: form.image_url,
          video_url: form.video_url || undefined,
          description: form.description,
          hashtags: hashtagList,
          slug: form.slug || generateSlug(form.description),
        },
        products: products.filter((p) => p.name && p.affiliate_url),
      };
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create post"); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => { router.push("/admin/posts"); router.refresh(); }, 800);
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const hasMedia = !!form.image_url || !!form.video_url;
  const isReady = hasMedia && !!form.description && !!form.slug && !uploading && !videoUploading;

  /* ── Render ───────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit}>
      {/* ── Alerts ── */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
          <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button type="button" onClick={() => setError(null)} className="text-red-300 hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5">
          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
          <p className="text-sm text-green-700 font-medium">Post created successfully! Redirecting…</p>
        </div>
      )}

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-6 items-start">

        {/* ══ LEFT COLUMN ══ */}
        <div className="space-y-5">

          {/* ── Section 1: Post Info ── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-6 py-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3C50E0] text-xs font-bold text-white shrink-0">1</span>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Post Information</h2>
                <p className="text-xs text-gray-500">Basic details about this post</p>
              </div>
            </div>
            <div className="p-6 space-y-5">

              {/* Creator */}
              <div>
                <label className={labelClass}>Creator <span className="text-red-500">*</span></label>
                <div className="relative">
                  {selectedCreator?.avatar_url ? (
                    <img src={selectedCreator.avatar_url} alt="" className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF2FF] text-[10px] font-bold text-[#3C50E0]">
                      {selectedCreator?.display_name?.charAt(0) || "?"}
                    </div>
                  )}
                  <select
                    value={form.creator_id}
                    onChange={(e) => setForm((p) => ({ ...p, creator_id: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/15 hover:border-gray-300 appearance-none cursor-pointer"
                  >
                    {creators.map((c) => (
                      <option key={c.id} value={c.id}>{c.display_name} (@{c.username})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                  <span className={`text-xs ${form.description.length > 280 ? "text-red-500" : "text-gray-400"}`}>
                    {form.description.length}/300
                  </span>
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  required
                  maxLength={300}
                  rows={4}
                  placeholder="Write a compelling description for this post…"
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Slug */}
              <div>
                <label className={labelClass}>URL Slug <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-0">
                  <span className="inline-flex h-10 items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 text-xs text-gray-400 whitespace-nowrap select-none">
                    /posts/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") }))}
                    required
                    placeholder="my-awesome-post"
                    className="flex-1 rounded-r-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/15"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Auto-generated from description — must be unique.</p>
              </div>

              {/* Hashtags */}
              <div>
                <label className={labelClass}>Hashtags <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={form.hashtags}
                    onChange={(e) => setForm((p) => ({ ...p, hashtags: e.target.value }))}
                    placeholder="fashion, streetwear, summer"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                {hashtagList.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {hashtagList.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#EFF2FF] px-2.5 py-0.5 text-xs font-medium text-[#3C50E0]">
                        <Tag size={10} />#{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 2: Media ── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-6 py-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3C50E0] text-xs font-bold text-white shrink-0">2</span>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Media</h2>
                <p className="text-xs text-gray-500">Upload image &amp; optional video for this post</p>
              </div>
            </div>
            {/* Side-by-side grid: image left, video right */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* ── Image column ── */}
                <div className="flex flex-col gap-3">
                  {/* Label row */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Post Image <span className="text-red-500">*</span>
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setForm((p) => ({ ...p, image_url: "" }));
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X size={12} /> Remove
                      </button>
                    )}
                  </div>

                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex-1 cursor-pointer rounded-xl border-2 border-dashed transition-all group overflow-hidden ${
                      isDragging
                        ? "border-[#3C50E0] bg-[#EFF2FF]/40"
                        : imagePreview
                        ? "border-gray-200 bg-transparent"
                        : "border-gray-200 bg-gray-50/50 hover:border-[#3C50E0] hover:bg-[#EFF2FF]/20"
                    }`}
                    style={{ minHeight: "160px" }}
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" style={{ minHeight: "160px", maxHeight: "220px" }} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                          <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow">Change image</span>
                        </div>
                        {uploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                            <Loader2 size={24} className="animate-spin text-white" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-10 gap-3">
                        {uploading ? (
                          <Loader2 size={28} className="animate-spin text-[#3C50E0]" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-[#EFF2FF] transition-colors">
                            <Upload size={22} className="text-gray-400 group-hover:text-[#3C50E0] transition-colors" />
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 group-hover:text-[#3C50E0] transition-colors">
                            {uploading ? "Uploading…" : "Click or drag to upload"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP — max 10 MB</p>
                        </div>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </div>

                  {/* URL fallback */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                      <span className="inline-block h-px w-6 bg-gray-200" />
                      or paste a URL
                      <span className="inline-block h-px w-6 bg-gray-200" />
                    </p>
                    <div className="relative">
                      <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={form.image_url}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, image_url: e.target.value }));
                          if (e.target.value) setImagePreview(e.target.value);
                        }}
                        placeholder="https://example.com/image.jpg"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Video column ── */}
                <div className="flex flex-col gap-3">
                  {/* Label row */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Video <span className="text-gray-400 font-normal text-xs">(optional)</span>
                    </label>
                    {(videoPreview || form.video_url) && (
                      <button
                        type="button"
                        onClick={() => { setVideoPreview(null); setForm((p) => ({ ...p, video_url: "" })); if (videoFileInputRef.current) videoFileInputRef.current.value = ""; }}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X size={12} /> Remove
                      </button>
                    )}
                  </div>

                  {/* Video preview */}
                  {(videoPreview || form.video_url) && !videoUploading ? (
                    <div className="relative rounded-xl overflow-hidden bg-black" style={{ minHeight: "160px" }}>
                      <video src={videoPreview || form.video_url} controls className="w-full h-full object-cover rounded-xl" style={{ minHeight: "160px", maxHeight: "220px" }} />
                    </div>
                  ) : !videoPreview && !form.video_url ? (
                    /* Drop zone (only when no video) */
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsVideoDragging(true); }}
                      onDragLeave={() => setIsVideoDragging(false)}
                      onDrop={handleVideoDrop}
                      onClick={() => videoFileInputRef.current?.click()}
                      className={`relative flex-1 cursor-pointer rounded-xl border-2 border-dashed transition-all group ${
                        isVideoDragging
                          ? "border-[#3C50E0] bg-[#EFF2FF]/40"
                          : "border-gray-200 bg-gray-50/50 hover:border-[#3C50E0] hover:bg-[#EFF2FF]/20"
                      }`}
                      style={{ minHeight: "160px" }}
                    >
                      <div className="flex flex-col items-center justify-center h-full py-10 gap-3">
                        {videoUploading ? (
                          <Loader2 size={28} className="animate-spin text-[#3C50E0]" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-[#EFF2FF] transition-colors">
                            <Film size={22} className="text-gray-400 group-hover:text-[#3C50E0] transition-colors" />
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 group-hover:text-[#3C50E0] transition-colors">
                            {videoUploading ? "Uploading video…" : "Click or drag to upload video"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">MP4, WebM, MOV — max 100 MB</p>
                        </div>
                      </div>
                      <input ref={videoFileInputRef} type="file" accept="video/*" onChange={handleVideoFileChange} className="hidden" />
                    </div>
                  ) : null}

                  {/* Uploading indicator */}
                  {videoUploading && (
                    <div className="flex items-center gap-2 rounded-xl border border-[#3C50E0]/20 bg-[#EFF2FF]/40 px-4 py-3">
                      <Loader2 size={15} className="animate-spin text-[#3C50E0] shrink-0" />
                      <p className="text-xs text-[#3C50E0] font-medium">Uploading video to storage…</p>
                    </div>
                  )}

                  {/* Replace button once video is set */}
                  {(videoPreview || form.video_url) && !videoUploading && (
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-2 text-xs text-gray-500 hover:border-[#3C50E0] hover:text-[#3C50E0] hover:bg-[#EFF2FF]/20 transition-all"
                    >
                      <Upload size={13} /> Replace video file
                    </button>
                  )}
                  <input ref={videoFileInputRef} type="file" accept="video/*" onChange={handleVideoFileChange} className="hidden" />

                  {/* URL fallback */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                      <span className="inline-block h-px w-6 bg-gray-200" />
                      or paste a video URL
                      <span className="inline-block h-px w-6 bg-gray-200" />
                    </p>
                    <div className="relative">
                      <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={form.video_url}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, video_url: e.target.value }));
                          if (e.target.value) setVideoPreview(null);
                        }}
                        placeholder="https://youtube.com/watch?v=..."
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── Section 3: Products ── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-4 sm:px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3C50E0] text-xs font-bold text-white shrink-0">3</span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    Linked Products
                    {products.length > 0 && (
                      <span className="inline-flex items-center rounded-full bg-[#3C50E0] px-2 py-0.5 text-[10px] font-bold text-white">
                        {products.length}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-gray-500">Affiliate products in this post</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addProduct}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#3C50E0] px-3 sm:px-3.5 py-2 text-xs font-medium text-white hover:bg-[#3545C4] transition-colors shadow-sm"
              >
                <Plus size={14} />
                <span>Add Product</span>
              </button>
            </div>

            <div className="p-6">
              {products.length === 0 ? (
                <button
                  type="button"
                  onClick={addProduct}
                  className="w-full flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 py-10 hover:border-[#3C50E0] hover:bg-[#EFF2FF]/20 transition-all group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-[#EFF2FF] transition-colors">
                    <ShoppingCart size={22} className="text-gray-400 group-hover:text-[#3C50E0] transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-[#3C50E0] transition-colors">Add your first product</p>
                    <p className="text-xs text-gray-400 mt-0.5">Link affiliate products to earn commissions</p>
                  </div>
                </button>
              ) : (
                <div className="space-y-3">
                  {products.map((product, index) => {
                    const isOpen = expandedProducts.has(index);
                    const isComplete = !!(product.name && product.affiliate_url);
                    return (
                      <div key={index} className={`rounded-xl border transition-all ${isComplete ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"}`}>
                        {/* Product header / accordion toggle */}
                        <div
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                          onClick={() => toggleProduct(index)}
                        >
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isComplete ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {isComplete ? <CheckCircle2 size={14} /> : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {product.name || `Product ${index + 1}`}
                            </p>
                            {product.retailer && (
                              <p className="text-xs text-gray-500 truncate">{product.retailer}{product.price ? ` · ${product.price}` : ""}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeProduct(index); }}
                              className="rounded-md p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X size={14} />
                            </button>
                            {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                          </div>
                        </div>

                        {/* Expanded fields */}
                        {isOpen && (
                          <div className="border-t border-gray-100 px-4 pb-4 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">Product Name <span className="text-red-500">*</span></label>
                              <input type="text" value={product.name} onChange={(e) => updateProduct(index, "name", e.target.value)} placeholder="e.g. Nike Air Max 270" className={inputClass} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">Retailer</label>
                              <input type="text" value={product.retailer} onChange={(e) => updateProduct(index, "retailer", e.target.value)} placeholder="e.g. Amazon, Nike" className={inputClass} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">Price</label>
                              <input type="text" value={product.price} onChange={(e) => updateProduct(index, "price", e.target.value)} placeholder="e.g. $89.99" className={inputClass} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">Affiliate URL <span className="text-red-500">*</span></label>
                              <input type="url" value={product.affiliate_url} onChange={(e) => updateProduct(index, "affiliate_url", e.target.value)} placeholder="https://..." className={inputClass} />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-xs font-medium text-gray-600">Product Image URL</label>
                              <input type="url" value={product.image_url} onChange={(e) => updateProduct(index, "image_url", e.target.value)} placeholder="https://..." className={inputClass} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add another */}
                  <button
                    type="button"
                    onClick={addProduct}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-[#3C50E0] hover:text-[#3C50E0] hover:bg-[#EFF2FF]/20 transition-all"
                  >
                    <Plus size={16} />
                    Add another product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN — Preview + Tips ══ */}
        <div className="space-y-5 lg:sticky lg:top-6">

          {/* Live Post Preview */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5">
              <Eye size={15} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
            </div>
            <div className="p-5">
              {/* Post card mock */}
              <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Image / Video thumbnail */}
                <div className="relative bg-gray-100 aspect-square max-h-52 overflow-hidden">
                  {imagePreview || form.image_url ? (
                    <img src={imagePreview || form.image_url} alt="" className="w-full h-full object-cover" />
                  ) : videoPreview || form.video_url ? (
                    <div className="relative w-full h-full min-h-[120px]">
                      <video src={videoPreview || form.video_url} className="w-full h-full object-cover" muted playsInline />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow">
                          <Film size={16} className="text-gray-700" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[120px] items-center justify-center">
                      <ImageIcon size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#3C50E0] to-[#60A5FA] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {selectedCreator?.display_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 leading-none">
                        {selectedCreator?.display_name || "Creator Name"}
                      </p>
                      <p className="text-[10px] text-gray-400">@{selectedCreator?.username || "username"}</p>
                    </div>
                  </div>
                  {form.description ? (
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{form.description}</p>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-gray-100 rounded-full w-full" />
                      <div className="h-2.5 bg-gray-100 rounded-full w-4/5" />
                      <div className="h-2.5 bg-gray-100 rounded-full w-3/5" />
                    </div>
                  )}
                  {hashtagList.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {hashtagList.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] text-[#3C50E0] font-medium">#{tag}</span>
                      ))}
                    </div>
                  )}
                  {products.filter(p => p.name).length > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <p className="text-[10px] font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                        <Package size={10} /> {products.filter(p => p.name).length} product{products.filter(p => p.name).length > 1 ? "s" : ""}
                      </p>
                      <div className="space-y-1">
                        {products.filter(p => p.name).slice(0, 2).map((p, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5">
                            <div className="h-6 w-6 rounded bg-gray-100 overflow-hidden shrink-0">
                              {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-gray-700 truncate">{p.name}</p>
                              {p.price && <p className="text-[10px] text-gray-400">{p.price}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3.5">
              <h3 className="text-sm font-semibold text-gray-700">Checklist</h3>
            </div>
            <div className="p-5 space-y-2.5">
              {[
                { label: "Creator selected", done: !!form.creator_id },
                { label: uploading || videoUploading ? "Uploading media…" : "Image or video uploaded", done: hasMedia || uploading || videoUploading },
                { label: "Description written", done: form.description.length >= 10 },
                { label: "Slug generated", done: !!form.slug },
                { label: "At least one product added", done: products.some(p => p.name && p.affiliate_url) },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all ${item.done ? "bg-green-100" : "bg-gray-100"}`}>
                    {item.done
                      ? <CheckCircle2 size={13} className="text-green-600" />
                      : <div className="h-2 w-2 rounded-full bg-gray-300" />
                    }
                  </div>
                  <span className={`text-xs transition-colors ${item.done ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit button — desktop sidebar */}
          <div className="hidden lg:block space-y-2">
            <button
              type="submit"
              disabled={loading || !isReady || success}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3C50E0] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#3545C4] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Publishing…" : success ? "Published!" : "Publish Post"}
            </button>
            <a
              href="/admin/posts"
              className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>

      {/* ── Sticky mobile submit bar (hidden on lg+) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <a
          href="/admin/posts"
          className="flex-1 flex items-center justify-center rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={loading || !isReady || success}
          className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-[#3C50E0] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3545C4] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Publishing…" : success ? "Published!" : "Publish Post"}
        </button>
      </div>
      {/* Bottom spacer for mobile sticky bar */}
      <div className="lg:hidden h-20" />
    </form>
  );
}
