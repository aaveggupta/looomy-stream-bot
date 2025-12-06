import { Sidebar } from "@/components/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double-check beta access (middleware should catch this, but this is a safeguard)
  const betaAccess = cookies().get("beta_access");
  if (!betaAccess || betaAccess.value !== "granted") {
    redirect("/access");
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
