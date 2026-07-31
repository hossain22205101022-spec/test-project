"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  UserPlus,
  ChevronLeft,
  X,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Posts",
    href: "/admin/posts",
    icon: FileText,
  },
  {
    label: "Create Post",
    href: "/admin/posts/new",
    icon: PlusCircle,
  },
  {
    label: "Creators",
    href: "/admin/creators",
    icon: Users,
  },
  {
    label: "Add Creator",
    href: "/admin/creators/new",
    icon: UserPlus,
  },
  {
    label: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    label: "Write Blog",
    href: "/admin/blogs/new",
    icon: PlusCircle,
  },
];

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden bg-[#1C2434] text-[#DEE4EE] duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 border-b border-[#2E3A4E]">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="text-xl font-bold bg-gradient-to-r from-[#3C50E0] to-[#60A5FA] bg-clip-text text-transparent">
                StyleFeed
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/admin" className="mx-auto">
              <span className="text-xl font-bold text-[#3C50E0]">SF</span>
            </Link>
          )}
          {/* Close button mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-[#2E3A4E] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear flex-1">
          <nav className="mt-4 px-3">
            <div>
              {!collapsed && (
                <h3 className="mb-2 ml-3 text-xs font-semibold uppercase tracking-wider text-[#8A99AF]">
                  Menu
                </h3>
              )}
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-[#3C50E0] text-white shadow-md"
                            : "text-[#DEE4EE] hover:bg-[#2E3A4E] hover:text-white"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon
                          size={20}
                          className={active ? "text-white" : "text-[#8A99AF] group-hover:text-white"}
                        />
                        {!collapsed && <span>{item.label}</span>}
                        {collapsed && (
                          <div className="absolute left-full ml-2 hidden group-hover:block rounded-md bg-[#1C2434] border border-[#2E3A4E] px-3 py-1.5 text-xs text-white shadow-lg whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>

        {/* Collapse Toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-center border-t border-[#2E3A4E] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#2E3A4E] transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
