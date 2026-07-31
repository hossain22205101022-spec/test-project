import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPostById, getAllCreators } from "@/lib/supabase/admin-queries";
import EditPostForm from "./EditPostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, creators] = await Promise.all([
    getPostById(id),
    getAllCreators(),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/posts" className="hover:text-[#3C50E0] transition-colors">
          Posts
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Edit Post</span>
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
          <h1 className="text-2xl font-bold text-gray-800">Edit Post</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Update post details and products
          </p>
        </div>
      </div>

      <EditPostForm post={post} creators={creators} />
    </div>
  );
}
