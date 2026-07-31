import { getDashboardStats, getAllPosts } from "@/lib/supabase/admin-queries";
import {
  Users,
  FileText,
  ShoppingBag,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentPosts = await getAllPosts();
  const latestPosts = recentPosts.slice(0, 5);

  const statCards = [
    {
      label: "Total Creators",
      value: stats.totalCreators,
      icon: Users,
      trend: "+12%",
      trendUp: true,
      bgColor: "bg-[#EFF2FF]",
      iconColor: "text-[#3C50E0]",
    },
    {
      label: "Total Posts",
      value: stats.totalPosts,
      icon: FileText,
      trend: "+8%",
      trendUp: true,
      bgColor: "bg-[#FEF3F2]",
      iconColor: "text-[#F04438]",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: ShoppingBag,
      trend: "+23%",
      trendUp: true,
      bgColor: "bg-[#ECFDF3]",
      iconColor: "text-[#12B76A]",
    },
    {
      label: "Total Follows",
      value: stats.totalFollows,
      icon: Heart,
      trend: "0%",
      trendUp: false,
      bgColor: "bg-[#FFF6ED]",
      iconColor: "text-[#F79009]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back! Here&apos;s what&apos;s happening with StyleFeed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#3C50E0] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3545C4] transition-colors"
          >
            <FileText size={16} />
            New Post
          </Link>
          <Link
            href="/admin/creators/new"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Users size={16} />
            Add Creator
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${stat.bgColor}`}
              >
                <stat.icon size={20} className={stat.iconColor} />
              </div>
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                  stat.trendUp
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {stat.trendUp ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-2xl font-bold text-gray-800">
                {stat.value.toLocaleString()}
              </h4>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Posts Table - spans 2 cols */}
        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                Recent Posts
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Latest content on the platform
              </p>
            </div>
            <Link
              href="/admin/posts"
              className="text-xs font-medium text-[#3C50E0] hover:text-[#3545C4] transition-colors"
            >
              View All →
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <FileText size={20} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">No posts yet</p>
              <Link
                href="/admin/posts/new"
                className="text-sm font-medium text-[#3C50E0] hover:underline"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Post
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden md:table-cell">
                      Creator
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                      Products
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {latestPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/feed/${post.creator?.username || "unknown"}/posts/${post.slug}`}
                          className="text-sm font-medium text-gray-800 hover:text-[#3C50E0] line-clamp-1 max-w-[200px] block transition-colors"
                        >
                          {post.description || post.slug}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <span className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {post.creator?.display_name?.charAt(0) || "?"}
                          </span>
                          {post.creator?.display_name || "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 hidden sm:table-cell">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {post.products?.length || 0} items
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                        {new Date(post.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats / Activity */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-800">
              Quick Actions
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Common tasks
            </p>
          </div>
          <div className="p-4 space-y-2">
            <Link
              href="/admin/posts/new"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3.5 hover:border-[#3C50E0]/30 hover:bg-[#EFF2FF]/50 transition-all group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF2FF] group-hover:bg-[#3C50E0] transition-colors">
                <FileText
                  size={18}
                  className="text-[#3C50E0] group-hover:text-white transition-colors"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Create New Post
                </p>
                <p className="text-xs text-gray-500">
                  Add content with products
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-gray-400 group-hover:text-[#3C50E0] transition-colors"
              />
            </Link>

            <Link
              href="/admin/creators/new"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3.5 hover:border-green-200 hover:bg-green-50/50 transition-all group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ECFDF3] group-hover:bg-[#12B76A] transition-colors">
                <Users
                  size={18}
                  className="text-[#12B76A] group-hover:text-white transition-colors"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Add Creator
                </p>
                <p className="text-xs text-gray-500">
                  New creator profile
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-gray-400 group-hover:text-[#12B76A] transition-colors"
              />
            </Link>

            <Link
              href="/admin/posts"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3.5 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF6ED] group-hover:bg-[#F79009] transition-colors">
                <Eye
                  size={18}
                  className="text-[#F79009] group-hover:text-white transition-colors"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Manage Posts
                </p>
                <p className="text-xs text-gray-500">
                  View &amp; edit all posts
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-gray-400 group-hover:text-[#F79009] transition-colors"
              />
            </Link>

            <Link
              href="/admin/creators"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3.5 hover:border-red-200 hover:bg-red-50/50 transition-all group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF3F2] group-hover:bg-[#F04438] transition-colors">
                <TrendingUp
                  size={18}
                  className="text-[#F04438] group-hover:text-white transition-colors"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  View Creators
                </p>
                <p className="text-xs text-gray-500">
                  Manage creator profiles
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-gray-400 group-hover:text-[#F04438] transition-colors"
              />
            </Link>
          </div>

          {/* Platform Summary */}
          <div className="border-t border-gray-100 px-6 py-4">
            <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
              Platform Summary
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Content Rate</span>
                <span className="text-sm font-semibold text-gray-800">
                  {stats.totalPosts > 0
                    ? (stats.totalProducts / stats.totalPosts).toFixed(1)
                    : "0"}{" "}
                  products/post
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-[#3C50E0] h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      ((stats.totalProducts / Math.max(stats.totalPosts, 1)) /
                        5) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Creator Avg</span>
                <span className="text-sm font-semibold text-gray-800">
                  {stats.totalCreators > 0
                    ? (stats.totalPosts / stats.totalCreators).toFixed(1)
                    : "0"}{" "}
                  posts/creator
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-[#12B76A] h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      ((stats.totalPosts / Math.max(stats.totalCreators, 1)) /
                        10) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
