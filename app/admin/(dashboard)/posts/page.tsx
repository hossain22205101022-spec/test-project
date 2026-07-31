import Link from "next/link";
import { getAllPosts } from "@/lib/supabase/admin-queries";
import { Plus, FileText, Calendar, Package, Pencil } from "lucide-react";
import DeletePostButton from "./DeletePostButton";

export default async function AdminPostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage all posts on the platform
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#3C50E0] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3545C4] transition-colors"
        >
          <Plus size={16} />
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            No posts yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Get started by creating your first post.
          </p>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#3C50E0] px-4 py-2 text-sm font-medium text-white hover:bg-[#3545C4] transition-colors"
          >
            <Plus size={16} />
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-800">{posts.length}</span>{" "}
              total posts
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden md:table-cell">
                    Creator
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden md:table-cell">
                    Slug
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                    Products
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                    Date
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                          {post.description || "No description"}
                        </p>
                        <p className="text-xs text-gray-500 md:hidden mt-0.5">
                          {post.creator?.display_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                        <span className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                          {post.creator?.display_name?.charAt(0) || "?"}
                        </span>
                        {post.creator?.display_name || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">
                        {post.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        <Package size={12} />
                        {post.products?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-[#3C50E0] transition-colors"
                        >
                          <Pencil size={12} />
                          Edit
                        </Link>
                        <Link
                          href={`/feed/${post.creator?.username || "unknown"}/posts/${post.slug}`}
                          className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-[#3C50E0] transition-colors"
                          target="_blank"
                        >
                          View
                        </Link>
                        <DeletePostButton postId={post.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
