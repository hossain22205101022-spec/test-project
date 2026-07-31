import { getAllCreators } from "@/lib/supabase/admin-queries";
import CreatePostForm from "./CreatePostForm";
import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";

export default async function NewPostPage() {
  const creators = await getAllCreators();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/admin/posts"
          className="hover:text-[#3C50E0] transition-colors"
        >
          Posts
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Create New</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/posts"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Post</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Add a new post to the feed with products
          </p>
        </div>
      </div>

      {creators.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-10 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Users size={24} className="text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            No creators available
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            You need to create a creator before publishing posts.
          </p>
          <Link
            href="/admin/creators/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#3C50E0] px-4 py-2 text-sm font-medium text-white hover:bg-[#3545C4] transition-colors"
          >
            Create a Creator
          </Link>
        </div>
      ) : (
        <CreatePostForm creators={creators} />
      )}
    </div>
  );
}
