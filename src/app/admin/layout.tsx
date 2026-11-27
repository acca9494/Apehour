import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  return (
    <div className="dashboard-layout">
      <AdminSidebar email={admin.email} />
      <div className="dashboard-main">
        <div className="dashboard-mobile-content">
          {children}
        </div>
      </div>
    </div>
  );
}
