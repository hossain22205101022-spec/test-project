import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/admin-queries";
import AdminShell from "./components/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminCheck = await isAdmin(user.id);
  if (!adminCheck) {
    redirect("/admin/login");
  }

  return (
    <AdminShell email={user.email || "admin"}>
      {children}
    </AdminShell>
  );
}
