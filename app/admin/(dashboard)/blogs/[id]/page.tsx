import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BlogForm from "../../components/BlogForm";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

export const metadata = {
  title: "Admin - Edit Blog | StyleFeed",
};

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !blog) {
    notFound();
  }

  return (
    <div className="space-y-5 w-full pb-12">
      <div className="flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
        {/* Left: back + title */}
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/admin/blogs"
            className="flex-shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Blogs</p>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 leading-tight truncate">
              {blog.title ? `Editing: ${blog.title}` : "Edit Blog Post"}
            </h1>
          </div>
        </div>

        {/* Right: status badge */}
        <div className={`flex-shrink-0 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
          blog.published
            ? "bg-green-50 border-green-100 text-green-600"
            : "bg-gray-50 border-gray-100 text-gray-500"
        }`}>
          <Pencil className="h-3.5 w-3.5" />
          {blog.published ? "Published" : "Draft"}
        </div>
      </div>

      <div className="w-full">
        <BlogForm initialData={blog} />
      </div>
    </div>
  );
}