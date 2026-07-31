import Link from "next/link";
import { getAllCreators } from "@/lib/supabase/admin-queries";
import { Plus, Users, Calendar } from "lucide-react";
import DeleteCreatorButton from "./DeleteCreatorButton";

export default async function AdminCreatorsPage() {
  const creators = await getAllCreators();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Creators</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage creator profiles on the platform
          </p>
        </div>
        <Link
          href="/admin/creators/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#3C50E0] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3545C4] transition-colors"
        >
          <Plus size={16} />
          Add Creator
        </Link>
      </div>

      {creators.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Users size={24} className="text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            No creators yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Get started by adding your first creator.
          </p>
          <Link
            href="/admin/creators/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#3C50E0] px-4 py-2 text-sm font-medium text-white hover:bg-[#3545C4] transition-colors"
          >
            <Plus size={16} />
            Add First Creator
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-800">
                {creators.length}
              </span>{" "}
              total creators
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Creator
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden md:table-cell">
                    Username
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                    Followers
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                    Joined
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {creators.map((creator) => (
                  <tr
                    key={creator.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {creator.avatar_url ? (
                          <img
                            src={creator.avatar_url}
                            alt={creator.display_name}
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#3C50E0] to-[#60A5FA] flex items-center justify-center text-xs font-bold text-white ring-2 ring-gray-100">
                            {creator.display_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {creator.display_name}
                          </p>
                          <p className="text-xs text-gray-500 md:hidden">
                            @{creator.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">
                        @{creator.username}
                      </code>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm font-medium text-gray-700">
                        {creator.follower_count?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {new Date(creator.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/explore/${creator.username}`}
                          className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-[#3C50E0] transition-colors"
                          target="_blank"
                        >
                          View
                        </Link>
                        <DeleteCreatorButton creatorId={creator.id} />
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
