import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BlogPost } from "@/types";
import { Pencil, Trash2, Eye, Plus, Search, MoreVertical, Calendar, FileText, LayoutGrid } from "lucide-react";

export const metadata = {
  title: "Admin - Blogs | StyleFeed",
};

export default async function AdminBlogsPage() {
  const supabase = await createClient();

  const { data: blogs, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching blogs:", error);
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Blogs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, create and publish your blog posts.</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Write Blog
        </Link>
      </div>

      {/* Stats/Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search blogs..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black focus:border-black sm:text-sm transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button className="p-1.5 bg-gray-100 text-gray-900 rounded-md shadow-sm">
              <FileText className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-500 hover:text-gray-900 rounded-md transition-colors">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Post Details</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium hidden sm:table-cell">Date</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!blogs || blogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 text-center">No blogs found</h3>
                      <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">
                        Get started by creating a new blog post to share with your audience.
                      </p>
                      <Link
                        href="/admin/blogs/new"
                        className="mt-4 inline-flex items-center text-sm font-medium text-black hover:underline"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Create your first post
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                blogs.map((blog: BlogPost) => (
                  <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {blog.image_url ? (
                          <div className="relative h-12 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 hidden sm:block">
                            <img src={blog.image_url} alt={blog.title} className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="h-12 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 hidden sm:flex">
                            <FileText className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1">{blog.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">/{blog.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          blog.published
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {blog.published ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            Published
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                            Draft
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 hidden sm:table-cell">
                      <div className="flex items-center text-xs">
                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                        {new Date(blog.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                        {blog.published && (
                          <Link
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        )}
                        <Link
                          href={`/admin/blogs/${blog.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {blogs && blogs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-900">{blogs.length}</span> results
            </span>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-400 bg-white cursor-not-allowed">Previous</button>
              <button disabled className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-400 bg-white cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}